package com.officereception.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.officereception.app.config.AppConfig
import com.officereception.app.config.AppLanguage
import com.officereception.app.domain.FormValidator
import com.officereception.app.domain.InterviewPurpose
import com.officereception.app.ui.components.BackChip
import com.officereception.app.ui.components.ChoiceChip
import com.officereception.app.ui.components.CornerMark
import com.officereception.app.ui.components.LanguageToggle
import com.officereception.app.ui.components.SoftBackground
import com.officereception.app.ui.components.SoftTextField
import com.officereception.app.ui.components.SubmitButton
import com.officereception.app.ui.components.rememberFitScale

@Composable
fun InterviewFormScreen(
    language: AppLanguage,
    onLanguageChange: (AppLanguage) -> Unit,
    purpose: InterviewPurpose?,
    visitorName: String,
    onPurposeSelected: (InterviewPurpose) -> Unit,
    onVisitorNameChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onBack: () -> Unit
) {
    val copy = AppConfig.copy(language)
    val canSubmit = FormValidator.canSubmitInterview(purpose, visitorName)

    SoftBackground {
        BoxWithConstraints(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 12.dp)
        ) {
            val scale = rememberFitScale(
                availableHeight = maxHeight,
                designHeight = 640.dp
            )

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
                    .padding(top = scale.dp(48f), bottom = scale.dp(8f))
                    .widthIn(max = 720.dp)
                    .align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(scale.dp(12f))
                ) {
                    Text(
                        text = copy.interviewTitle,
                        color = AppConfig.Colors.Ink,
                        fontSize = scale.sp(26f),
                        fontWeight = FontWeight.Bold
                    )
                    SoftTextField(
                        label = copy.visitorName,
                        value = visitorName,
                        onValueChange = onVisitorNameChange,
                        placeholder = copy.namePlaceholder,
                        scale = scale
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(scale.dp(14f))
                    ) {
                        ChoiceChip(
                            text = copy.purposeInterview,
                            selected = purpose == InterviewPurpose.Interview,
                            onClick = { onPurposeSelected(InterviewPurpose.Interview) },
                            modifier = Modifier.weight(1f),
                            scale = scale
                        )
                        ChoiceChip(
                            text = copy.purposeBriefing,
                            selected = purpose == InterviewPurpose.Training,
                            onClick = { onPurposeSelected(InterviewPurpose.Training) },
                            modifier = Modifier.weight(1f),
                            scale = scale
                        )
                    }
                    Text(
                        text = copy.interviewFormHint,
                        color = AppConfig.Colors.InkMuted,
                        fontSize = scale.sp(13f),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                SubmitButton(
                    text = copy.submit,
                    onClick = onSubmit,
                    enabled = canSubmit,
                    scale = scale,
                    modifier = Modifier
                        .widthIn(max = 360.dp)
                        .fillMaxWidth(0.5f)
                        .padding(bottom = scale.dp(18f))
                )
            }

            CornerMark(modifier = Modifier.align(Alignment.BottomStart))
        }
    }
}
