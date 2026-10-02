package com.officereception.app.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.officereception.app.config.AppConfig
import com.officereception.app.ui.components.PrimaryButton
import com.officereception.app.ui.components.SecondaryButton

@Composable
fun StatusScreen(message: String) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(AppConfig.Colors.Yellow)
            .padding(32.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            if (message == AppConfig.Text.sending || message == AppConfig.Text.loading) {
                CircularProgressIndicator(color = AppConfig.Colors.Ink)
                Spacer(modifier = Modifier.height(24.dp))
            }
            Text(
                text = message,
                color = AppConfig.Colors.Ink,
                fontSize = 36.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun ErrorScreen(
    title: String,
    body: String,
    onRetry: () -> Unit,
    onHome: () -> Unit,
    showHome: Boolean = true
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = title, color = AppConfig.Colors.Error, fontSize = 36.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text(text = body, color = AppConfig.Colors.Ink, fontSize = 22.sp)
        Spacer(modifier = Modifier.height(32.dp))
        if (showHome) {
            Row(modifier = Modifier.fillMaxWidth()) {
                SecondaryButton(
                    text = AppConfig.Text.home,
                    onClick = onHome,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(16.dp))
                PrimaryButton(
                    text = AppConfig.Text.retry,
                    onClick = onRetry,
                    modifier = Modifier.weight(1.2f)
                )
            }
        } else {
            PrimaryButton(
                text = AppConfig.Text.retry,
                onClick = onRetry
            )
        }
    }
}
