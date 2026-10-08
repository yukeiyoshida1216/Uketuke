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
import com.officereception.app.domain.Destination
import com.officereception.app.domain.FormValidator
import com.officereception.app.ui.components.BackChip
import com.officereception.app.ui.components.ChoiceChip
import com.officereception.app.ui.components.CornerMark
import com.officereception.app.ui.components.LanguageToggle
import com.officereception.app.ui.components.SoftBackground
import com.officereception.app.ui.components.SoftDropdown
import com.officereception.app.ui.components.SoftTextField
import com.officereception.app.ui.components.SubmitButton
import com.officereception.app.ui.components.rememberFitScale

@Composable
fun GeneralFormScreen(
    language: AppLanguage,
    onLanguageChange: (AppLanguage) -> Unit,
    companyName: String,
    visitorName: String,
    partySize: String,
    destinations: List<Destination>,
    selectedDestinationId: String?,
    onCompanyNameChange: (String) -> Unit,
    onVisitorNameChange: (String) -> Unit,
    onPartySizeSelected: (String) -> Unit,
    onDestinationSelected: (String) -> Unit,
    onSubmit: () -> Unit,
    onBack: () -> Unit
) {
    val copy = AppConfig.copy(language)
    val canProceed = FormValidator.canSubmitGeneral(
        companyName,
        visitorName,
        partySize,
        selectedDestinationId
    )
    val partyOptions = listOf(
        "1" to copy.party1,
        "2" to copy.party2,
        "3" to copy.party3,
        "4" to copy.party4Plus
    )

    SoftBackground {
        BoxWithConstraints(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 12.dp)
        ) {
            val scale = rememberFitScale(
                availableHeight = maxHeight,
                designHeight = 760.dp
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
                    verticalArrangement = Arrangement.spacedBy(scale.dp(8f))
                ) {
                    Text(
                        text = copy.generalTitle,
                        color = AppConfig.Colors.Ink,
                        fontSize = scale.sp(26f),
                        fontWeight = FontWeight.Bold
                    )
                    SoftTextField(
                        label = copy.company,
                        value = companyName,
                        onValueChange = onCompanyNameChange,
                        placeholder = copy.companyPlaceholder,
                        scale = scale
                    )
                    SoftTextField(
                        label = copy.visitorName,
                        value = visitorName,
                        onValueChange = onVisitorNameChange,
                        placeholder = copy.namePlaceholder,
                        scale = scale
                    )
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = copy.partySize,
                            color = AppConfig.Colors.Ink,
                            fontSize = scale.sp(15f),
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(scale.dp(5f)))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(scale.dp(10f))
                        ) {
                            partyOptions.forEach { (value, label) ->
                                ChoiceChip(
                                    text = label,
                                    selected = partySize == value,
                                    onClick = { onPartySizeSelected(value) },
                                    modifier = Modifier.weight(1f),
                                    scale = scale
                                )
                            }
                        }
                    }
                    SoftDropdown(
                        label = copy.destination,
                        placeholder = copy.destinationPlaceholder,
                        destinations = destinations,
                        selectedDestinationId = selectedDestinationId,
                        onDestinationSelected = onDestinationSelected,
                        scale = scale
                    )
                    Text(
                        text = copy.requiredNote,
                        color = AppConfig.Colors.InkMuted,
                        fontSize = scale.sp(12f),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                SubmitButton(
                    text = copy.submit,
                    onClick = onSubmit,
                    enabled = canProceed,
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
