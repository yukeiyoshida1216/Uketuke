package com.officereception.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.officereception.app.kiosk.ImmersiveKioskPolicy
import com.officereception.app.kiosk.KioskPolicy
import com.officereception.app.ui.ReceptionApp
import com.officereception.app.ui.theme.ReceptionTheme

class MainActivity : ComponentActivity() {
    private val kioskPolicy: KioskPolicy = ImmersiveKioskPolicy()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        kioskPolicy.apply(this)
        setContent {
            ReceptionTheme {
                ReceptionApp()
            }
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            kioskPolicy.apply(this)
        }
    }
}
