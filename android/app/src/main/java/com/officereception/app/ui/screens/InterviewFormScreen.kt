package com.officereception.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.officereception.app.config.AppConfig
import com.officereception.app.domain.FormValidator
import com.officereception.app.domain.InterviewPurpose
import com.officereception.app.ui.components.PrimaryButton
import com.officereception.app.ui.components.ReceptionField
import com.officereception.app.ui.components.SecondaryButton
import com.officereception.app.ui.components.SelectableButton

@Composable
fun InterviewFormScreen(
    purpose: InterviewPurpose?,
    visitorName: String,
    onPurposeSelected: (InterviewPurpose) -> Unit,
    onVisitorNameChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onBack: () -> Unit
) {
    val canSubmit = FormValidator.canSubmitInterview(purpose, visitorName)
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = AppConfig.Text.interviewTitle,
            fontSize = 32.sp,
            color = AppConfig.Colors.Ink
        )
        Text(
            text = AppConfig.Text.purposeTitle,
            fontSize = 22.sp,
            color = AppConfig.Colors.Ink
        )
        Row(modifier = Modifier.fillMaxWidth()) {
            SelectableButton(
                text = AppConfig.Text.purposeInterview,
                selected = purpose == InterviewPurpose.Interview,
                onClick = { onPurposeSelected(InterviewPurpose.Interview) },
                modifier = Modifier.weight(1f)
            )
            Spacer(modifier = Modifier.width(16.dp))
            SelectableButton(
                text = AppConfig.Text.purposeTraining,
                selected = purpose == InterviewPurpose.Training,
                onClick = { onPurposeSelected(InterviewPurpose.Training) },
                modifier = Modifier.weight(1f)
            )
        }
        ReceptionField(AppConfig.Text.visitorName, visitorName, onVisitorNameChange)
        Spacer(modifier = Modifier.height(8.dp))
        Row(modifier = Modifier.fillMaxWidth()) {
            SecondaryButton(
                text = AppConfig.Text.back,
                onClick = onBack,
                modifier = Modifier.weight(1f)
            )
            Spacer(modifier = Modifier.width(16.dp))
            PrimaryButton(
                text = AppConfig.Text.call,
                onClick = onSubmit,
                enabled = canSubmit,
                modifier = Modifier.weight(1.4f)
            )
        }
    }
}
