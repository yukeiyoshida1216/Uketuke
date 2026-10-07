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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.officereception.app.config.AppConfig
import com.officereception.app.config.AppLanguage
import com.officereception.app.ui.components.BackChip
import com.officereception.app.ui.components.CornerMark
import com.officereception.app.ui.components.LanguageToggle
import com.officereception.app.ui.components.MenuIconKind
import com.officereception.app.ui.components.SoftBackground
import com.officereception.app.ui.components.SoftCard

@Composable
fun MenuScreen(
    language: AppLanguage,
    onLanguageChange: (AppLanguage) -> Unit,
    onGeneral: () -> Unit,
    onInterview: () -> Unit,
    onOther: () -> Unit,
    onBack: () -> Unit
) {
    val copy = AppConfig.copy(language)

    SoftBackground {
        BoxWithConstraints(
            modifier = Modifier
                .fillMaxSize()
                .padding(28.dp)
        ) {
            val landscape = maxWidth > maxHeight

            BackChip(
                text = copy.back,
                onClick = onBack,
                modifier = Modifier.align(Alignment.TopStart)
            )
            LanguageToggle(
                language = language,
                onLanguageChange = onLanguageChange,
                copy = copy,
                modifier = Modifier.align(Alignment.TopEnd)
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 64.dp, bottom = 40.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = copy.menuTitle,
                    color = AppConfig.Colors.Ink,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(28.dp))
                if (landscape) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        horizontalArrangement = Arrangement.spacedBy(20.dp)
                    ) {
                        SoftCard(
                            title = copy.generalTitle,
                            subtitle = copy.generalSubtitle,
                            icon = MenuIconKind.Business,
                            onClick = onGeneral,
                            modifier = Modifier.weight(1f).fillMaxSize()
                        )
                        SoftCard(
                            title = copy.interviewTitle,
                            subtitle = copy.interviewSubtitle,
                            icon = MenuIconKind.Interview,
                            onClick = onInterview,
                            modifier = Modifier.weight(1f).fillMaxSize()
                        )
                        SoftCard(
                            title = copy.otherTitle,
                            subtitle = copy.otherSubtitle,
                            icon = MenuIconKind.Other,
                            onClick = onOther,
                            modifier = Modifier.weight(1f).fillMaxSize()
                        )
                    }
                } else {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        SoftCard(
                            title = copy.generalTitle,
                            subtitle = copy.generalSubtitle,
                            icon = MenuIconKind.Business,
                            onClick = onGeneral,
                            modifier = Modifier.weight(1f).fillMaxWidth()
                        )
                        SoftCard(
                            title = copy.interviewTitle,
                            subtitle = copy.interviewSubtitle,
                            icon = MenuIconKind.Interview,
                            onClick = onInterview,
                            modifier = Modifier.weight(1f).fillMaxWidth()
                        )
                        SoftCard(
                            title = copy.otherTitle,
                            subtitle = copy.otherSubtitle,
                            icon = MenuIconKind.Other,
                            onClick = onOther,
                            modifier = Modifier.weight(1f).fillMaxWidth()
                        )
                    }
                }
            }

            CornerMark(modifier = Modifier.align(Alignment.BottomStart))
        }
    }
}
