package jp.reception.kiosk;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;

/**
 * 全画面表示。lockDown が有効なときだけ、他アプリへ移れないロックタスクを試みる。
 * デバイスオーナー未設定でも受付画面自体は使える。
 */
public final class KioskController {
    private final Activity activity;
    private final boolean lockDown;

    public KioskController(Activity activity, boolean lockDown) {
        this.activity = activity;
        this.lockDown = lockDown;
    }

    public void apply() {
        activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        enterImmersive();
        if (!lockDown) {
            return;
        }
        DevicePolicyManager manager = activity.getSystemService(DevicePolicyManager.class);
        ComponentName admin = new ComponentName(activity, KioskDeviceAdminReceiver.class);
        if (manager != null && manager.isDeviceOwnerApp(activity.getPackageName())) {
            manager.setLockTaskPackages(admin, new String[] {activity.getPackageName()});
            activity.startLockTask();
            return;
        }
        try {
            activity.startLockTask();
        } catch (IllegalArgumentException | IllegalStateException ignored) {
            // ホワイトリスト前は全画面のままにし、固定は後から有効化する。
        }
    }

    @SuppressWarnings("deprecation")
    public void enterImmersive() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            activity.getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController controller = activity.getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
            return;
        }
        View decor = activity.getWindow().getDecorView();
        decor.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
    }
}
