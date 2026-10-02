package com.officereception.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.officereception.app.config.AppConfig
import com.officereception.app.ui.components.PrimaryButton

@Composable
fun MenuScreen(
    onGeneral: () -> Unit,
    onInterview: () -> Unit,
    onDelivery: () -> Unit
) {
    BoxWithConstraints(modifier = Modifier.fillMaxSize().padding(32.dp)) {
        val landscape = maxWidth > maxHeight
        Column(modifier = Modifier.fillMaxSize()) {
            Text(
                text = AppConfig.Text.menuTitle,
                fontSize = 32.sp,
                color = AppConfig.Colors.Ink
            )
            Spacer(modifier = Modifier.height(24.dp))
            if (landscape) {
                Row(
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    horizontalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    PrimaryButton(AppConfig.Text.general, onGeneral, Modifier.weight(1f))
                    PrimaryButton(AppConfig.Text.interview, onInterview, Modifier.weight(1f))
                    PrimaryButton(AppConfig.Text.delivery, onDelivery, Modifier.weight(1f))
                }
            } else {
                Column(
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    PrimaryButton(AppConfig.Text.general, onGeneral, Modifier.weight(1f))
                    PrimaryButton(AppConfig.Text.interview, onInterview, Modifier.weight(1f))
                    PrimaryButton(AppConfig.Text.delivery, onDelivery, Modifier.weight(1f))
                    Spacer(modifier = Modifier.weight(0.15f))
                }
            }
        }
    }
}
