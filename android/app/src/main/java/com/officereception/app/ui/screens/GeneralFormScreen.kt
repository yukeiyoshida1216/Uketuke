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
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        text = copy.generalTitle,
                        color = AppConfig.Colors.Ink,
                        fontSize = 30.sp,
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
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
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
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                }

                SubmitButton(
                    text = copy.submit,
                    onClick = onSubmit,
                    enabled = canProceed,
                    modifier = Modifier
                        .fillMaxWidth(0.55f)
                        .padding(bottom = 28.dp)
                )
            }

            CornerMark(modifier = Modifier.align(Alignment.BottomStart))
        }
    }
}
