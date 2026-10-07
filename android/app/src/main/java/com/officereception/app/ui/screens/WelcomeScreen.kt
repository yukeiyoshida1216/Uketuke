package com.officereception.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.officereception.app.config.AppConfig
import com.officereception.app.config.AppLanguage
import com.officereception.app.ui.components.BrandLogo
import com.officereception.app.ui.components.CornerMark
import com.officereception.app.ui.components.DeliveryShortcut
import com.officereception.app.ui.components.LanguageToggle
import com.officereception.app.ui.components.SoftBackground
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlinx.coroutines.delay

@Composable
fun WelcomeScreen(
    language: AppLanguage,
    onLanguageChange: (AppLanguage) -> Unit,
    onTap: () -> Unit,
    onDelivery: () -> Unit
) {
    val copy = AppConfig.copy(language)
    var now by remember { mutableStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) {
        while (true) {
            now = System.currentTimeMillis()
            delay(1_000)
        }
    }
    val dateText = remember(now) {
        SimpleDateFormat("MM/dd", Locale.US).format(Date(now))
    }
    val timeText = remember(now) {
        SimpleDateFormat("HH:mm:ss", Locale.US).format(Date(now))
    }

    SoftBackground {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clickable(
                    indication = null,
                    interactionSource = remember { MutableInteractionSource() },
                    onClick = onTap
                )
                .padding(28.dp)
        ) {
            Column(modifier = Modifier.align(Alignment.TopStart)) {
                Text(
                    text = dateText,
                    color = AppConfig.Colors.InkMuted,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = timeText,
                    color = AppConfig.Colors.InkMuted,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            LanguageToggle(
                language = language,
                onLanguageChange = onLanguageChange,
                copy = copy,
                modifier = Modifier.align(Alignment.TopEnd)
            )

            Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = copy.welcome,
                    color = AppConfig.Colors.Accent,
                    fontSize = 48.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 4.sp
                )
                Spacer(modifier = Modifier.height(16.dp))
                BrandLogo(size = 96.dp)
                Spacer(modifier = Modifier.height(18.dp))
                Text(
                    text = AppConfig.Brand.companyJa,
                    color = AppConfig.Colors.Ink,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = AppConfig.Brand.companyEnLine1,
                    color = AppConfig.Colors.Ink,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 6.sp
                )
                Text(
                    text = AppConfig.Brand.companyEnLine2,
                    color = AppConfig.Colors.Ink,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 6.sp
                )
                Spacer(modifier = Modifier.height(28.dp))
                Text(
                    text = copy.touchHint,
                    color = AppConfig.Colors.Accent,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center
                )
            }

            DeliveryShortcut(
                label = copy.delivery,
                onClick = onDelivery,
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(end = 8.dp)
            )

            CornerMark(modifier = Modifier.align(Alignment.BottomStart))
        }
    }
}
