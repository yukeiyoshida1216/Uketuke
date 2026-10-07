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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import com.officereception.app.domain.FormValidator
import com.officereception.app.domain.InterviewPurpose
import com.officereception.app.ui.components.BackChip
import com.officereception.app.ui.components.ChoiceChip
import com.officereception.app.ui.components.CornerMark
import com.officereception.app.ui.components.LanguageToggle
import com.officereception.app.ui.components.SoftBackground
import com.officereception.app.ui.components.SoftTextField
import com.officereception.app.ui.components.SubmitButton

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
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(28.dp)
        ) {
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
                    .padding(top = 64.dp, bottom = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(18.dp)
                ) {
                    Text(
                        text = copy.interviewTitle,
                        color = AppConfig.Colors.Ink,
                        fontSize = 30.sp,
                        fontWeight = FontWeight.Bold
                    )
                    SoftTextField(
                        label = copy.visitorName,
                        value = visitorName,
                        onValueChange = onVisitorNameChange,
                        placeholder = copy.namePlaceholder
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        ChoiceChip(
                            text = copy.purposeInterview,
                            selected = purpose == InterviewPurpose.Interview,
                            onClick = { onPurposeSelected(InterviewPurpose.Interview) },
                            modifier = Modifier.weight(1f)
                        )
                        ChoiceChip(
                            text = copy.purposeBriefing,
                            selected = purpose == InterviewPurpose.Training,
                            onClick = { onPurposeSelected(InterviewPurpose.Training) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    Text(
                        text = copy.interviewFormHint,
                        color = AppConfig.Colors.InkMuted,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }

                SubmitButton(
                    text = copy.submit,
                    onClick = onSubmit,
                    enabled = canSubmit,
                    modifier = Modifier
                        .fillMaxWidth(0.55f)
                        .padding(bottom = 28.dp)
                )
            }

            CornerMark(modifier = Modifier.align(Alignment.BottomStart))
        }
    }
}
