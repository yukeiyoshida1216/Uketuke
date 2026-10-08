package com.officereception.app.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Scales Soft UI spacing/type against available viewport height so forms
 * stay on a single screen across tablet sizes without scrolling.
 */
data class FitScale(val value: Float) {
    fun dp(base: Float): Dp = (base * value).dp
    fun sp(base: Float): TextUnit = (base * value).sp
}

@Composable
fun rememberFitScale(
    availableHeight: Dp,
    designHeight: Dp = 720.dp,
    minScale: Float = 0.55f,
    maxScale: Float = 1f
): FitScale {
    return remember(availableHeight, designHeight, minScale, maxScale) {
        val raw = if (designHeight.value <= 0f) {
            1f
        } else {
            availableHeight.value / designHeight.value
        }
        FitScale(raw.coerceIn(minScale, maxScale))
    }
}
