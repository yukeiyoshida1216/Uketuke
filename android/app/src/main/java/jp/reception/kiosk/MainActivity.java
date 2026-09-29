package jp.reception.kiosk;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** 受付画面を全画面の WebView で開く。戻る操作ではアプリを終了しない。 */
public class MainActivity extends Activity {
    private WebView webView;
    private KioskController kiosk;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        kiosk = new KioskController(this, BuildConfig.LOCK_DOWN);
        kiosk.apply();

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        webView.addJavascriptInterface(new ReloadBridge(), "ReceptionKiosk");
        webView.setWebViewClient(new ReceptionClient());
        setContentView(webView);
        webView.loadUrl(BuildConfig.KIOSK_URL);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        kiosk.enterImmersive();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            kiosk.enterImmersive();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        kiosk.enterImmersive();
    }

    private boolean isAllowed(Uri uri) {
        Uri allowed = Uri.parse(BuildConfig.KIOSK_URL);
        if (uri.getHost() == null || allowed.getHost() == null) {
            return false;
        }
        if (!uri.getHost().equalsIgnoreCase(allowed.getHost())) {
            return false;
        }
        return portOf(uri) == portOf(allowed);
    }

    private int portOf(Uri uri) {
        if (uri.getPort() != -1) {
            return uri.getPort();
        }
        return "https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80;
    }

    private void showOfflinePage() {
        String html = "<!DOCTYPE html><html lang=\"ja\"><head><meta charset=\"utf-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
                + "<style>body{margin:0;min-height:100vh;display:grid;place-items:center;"
                + "background:#FFF4C8;color:#4A3728;font-family:sans-serif;text-align:center}"
                + "button{font-size:2rem;padding:1.2rem 2rem;border:0;border-radius:1.5rem;"
                + "background:#F5A524;color:#fff}</style></head><body>"
                + "<div><p style=\"font-size:2rem\">受付画面を表示できません</p>"
                + "<button type=\"button\" onclick=\"ReceptionKiosk.reload()\">再読み込み</button></div>"
                + "</body></html>";
        webView.loadDataWithBaseURL(BuildConfig.KIOSK_URL, html, "text/html", "utf-8", null);
    }

    private final class ReceptionClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return !isAllowed(request.getUrl());
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) {
                showOfflinePage();
            }
        }

        @Override
        public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
            if (request.isForMainFrame() && errorResponse.getStatusCode() >= 500) {
                showOfflinePage();
            }
        }
    }

    private final class ReloadBridge {
        @JavascriptInterface
        public void reload() {
            runOnUiThread(() -> webView.loadUrl(BuildConfig.KIOSK_URL));
        }
    }
}
