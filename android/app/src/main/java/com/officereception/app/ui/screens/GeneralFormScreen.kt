package com.officereception.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.officereception.app.config.AppConfig
import com.officereception.app.domain.Destination
import com.officereception.app.domain.FormValidator
import com.officereception.app.ui.components.PrimaryButton
import com.officereception.app.ui.components.ReceptionField
import com.officereception.app.ui.components.SecondaryButton

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GeneralFormScreen(
    companyName: String,
    visitorName: String,
    partySize: String,
    destinations: List<Destination>,
    selectedDestinationId: String?,
    onCompanyNameChange: (String) -> Unit,
    onVisitorNameChange: (String) -> Unit,
    onPartySizeChange: (String) -> Unit,
    onDestinationSelected: (String) -> Unit,
    onSubmit: () -> Unit,
    onBack: () -> Unit
) {
    val canProceed = FormValidator.canSubmitGeneral(
        companyName,
        visitorName,
        partySize,
        selectedDestinationId
    )
    val selectedLabel = destinations
        .firstOrNull { it.id == selectedDestinationId }
        ?.displayName
        .orEmpty()
    var expanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        ReceptionField(AppConfig.Text.company, companyName, onCompanyNameChange)
        ReceptionField(AppConfig.Text.visitorName, visitorName, onVisitorNameChange)
        ReceptionField(
            label = AppConfig.Text.partySize,
            value = partySize,
            onValueChange = onPartySizeChange,
            keyboardType = KeyboardType.Number
        )
        Text(
            text = AppConfig.Text.destinationLabel,
            fontSize = 20.sp,
            color = AppConfig.Colors.Ink
        )
        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { expanded = it },
            modifier = Modifier.fillMaxWidth()
        ) {
            OutlinedTextField(
                value = selectedLabel.ifEmpty { AppConfig.Text.destinationPlaceholder },
                onValueChange = {},
                readOnly = true,
                modifier = Modifier
                    .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                    .fillMaxWidth()
                    .heightIn(min = 64.dp),
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                textStyle = TextStyle(
                    fontSize = 22.sp,
                    color = if (selectedLabel.isEmpty()) {
                        AppConfig.Colors.Ink.copy(alpha = 0.45f)
                    } else {
                        AppConfig.Colors.Ink
                    }
                ),
                shape = RoundedCornerShape(12.dp)
            )
            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false }
            ) {
                destinations.forEach { destination ->
                    DropdownMenuItem(
                        text = {
                            Text(
                                text = destination.displayName,
                                fontSize = 22.sp,
                                color = AppConfig.Colors.Ink
                            )
                        },
                        onClick = {
                            onDestinationSelected(destination.id)
                            expanded = false
                        },
                        modifier = Modifier.heightIn(min = 56.dp)
                    )
                }
            }
        }
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
                enabled = canProceed,
                modifier = Modifier.weight(1.4f)
            )
        }
    }
}
