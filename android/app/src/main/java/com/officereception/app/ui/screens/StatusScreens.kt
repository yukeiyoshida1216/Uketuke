package com.officereception.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.officereception.app.config.AppConfig
import com.officereception.app.config.AppLanguage
import com.officereception.app.ui.components.CornerMark
import com.officereception.app.ui.components.PrimaryButton
import com.officereception.app.ui.components.SecondaryButton
import com.officereception.app.ui.components.SoftBackground

@Composable
fun StatusScreen(
    message: String,
    showProgress: Boolean = false
) {
    SoftBackground {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                if (showProgress) {
                    CircularProgressIndicator(color = AppConfig.Colors.Accent)
                    Spacer(modifier = Modifier.height(24.dp))
                }
                Text(
                    text = message,
                    color = AppConfig.Colors.Ink,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
            }
            CornerMark(modifier = Modifier.align(Alignment.BottomStart))
        }
    }
}

@Composable
fun ErrorScreen(
    language: AppLanguage,
    title: String,
    body: String,
    onRetry: () -> Unit,
    onHome: () -> Unit,
    showHome: Boolean = true
) {
    val copy = AppConfig.copy(language)
    SoftBackground {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = 40.dp),
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = title,
                    color = AppConfig.Colors.Error,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(text = body, color = AppConfig.Colors.Ink, fontSize = 22.sp)
                Spacer(modifier = Modifier.height(32.dp))
                if (showHome) {
                    Row(modifier = Modifier.fillMaxWidth()) {
                        SecondaryButton(
                            text = copy.home,
                            onClick = onHome,
                            modifier = Modifier.weight(1f)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        PrimaryButton(
                            text = copy.retry,
                            onClick = onRetry,
                            modifier = Modifier.weight(1.2f)
                        )
                    }
                } else {
                    PrimaryButton(
                        text = copy.retry,
                        onClick = onRetry
                    )
                }
            }
            CornerMark(modifier = Modifier.align(Alignment.BottomStart))
        }
    }
}
