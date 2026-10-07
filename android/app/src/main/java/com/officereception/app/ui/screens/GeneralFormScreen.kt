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
import androidx.compose.foundation.layout.widthIn
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
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp, vertical = 16.dp)
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
                    .padding(top = 52.dp, bottom = 4.dp)
                    .widthIn(max = 720.dp)
                    .align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = copy.generalTitle,
                        color = AppConfig.Colors.Ink,
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Bold
                    )
                    SoftTextField(
                        label = copy.company,
                        value = companyName,
                        onValueChange = onCompanyNameChange,
                        placeholder = copy.companyPlaceholder
                    )
                    SoftTextField(
                        label = copy.visitorName,
                        value = visitorName,
                        onValueChange = onVisitorNameChange,
                        placeholder = copy.namePlaceholder
                    )
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = copy.partySize,
                            color = AppConfig.Colors.Ink,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            partyOptions.forEach { (value, label) ->
                                ChoiceChip(
                                    text = label,
                                    selected = partySize == value,
                                    onClick = { onPartySizeSelected(value) },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }
                    SoftDropdown(
                        label = copy.destination,
                        placeholder = copy.destinationPlaceholder,
                        destinations = destinations,
                        selectedDestinationId = selectedDestinationId,
                        onDestinationSelected = onDestinationSelected
                    )
                    Text(
                        text = copy.requiredNote,
                        color = AppConfig.Colors.InkMuted,
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                SubmitButton(
                    text = copy.submit,
                    onClick = onSubmit,
                    enabled = canProceed,
                    modifier = Modifier
                        .widthIn(max = 360.dp)
                        .fillMaxWidth(0.5f)
                        .padding(bottom = 20.dp)
                )
            }

            CornerMark(modifier = Modifier.align(Alignment.BottomStart))
        }
    }
}
