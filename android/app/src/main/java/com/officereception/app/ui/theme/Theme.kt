package com.officereception.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.officereception.app.R
import com.officereception.app.config.AppConfig

val NotoSansJp = FontFamily(
    Font(R.font.noto_sans_jp, FontWeight.Normal),
    Font(R.font.noto_sans_jp, FontWeight.Medium),
    Font(R.font.noto_sans_jp, FontWeight.Bold)
)

private val ColorScheme = lightColorScheme(
    primary = AppConfig.Colors.Accent,
    onPrimary = AppConfig.Colors.White,
    secondary = AppConfig.Colors.AccentBorder,
    onSecondary = AppConfig.Colors.Ink,
    background = AppConfig.Colors.CreamTop,
    onBackground = AppConfig.Colors.Ink,
    surface = AppConfig.Colors.Card,
    onSurface = AppConfig.Colors.Ink,
    error = AppConfig.Colors.Error
)

private val AppTypography = Typography(
    displayLarge = TextStyle(fontFamily = NotoSansJp, fontWeight = FontWeight.Bold, fontSize = 48.sp),
    headlineLarge = TextStyle(fontFamily = NotoSansJp, fontWeight = FontWeight.Bold, fontSize = 36.sp),
    headlineMedium = TextStyle(fontFamily = NotoSansJp, fontWeight = FontWeight.Medium, fontSize = 28.sp),
    titleLarge = TextStyle(fontFamily = NotoSansJp, fontWeight = FontWeight.Medium, fontSize = 24.sp),
    bodyLarge = TextStyle(fontFamily = NotoSansJp, fontWeight = FontWeight.Normal, fontSize = 22.sp),
    labelLarge = TextStyle(fontFamily = NotoSansJp, fontWeight = FontWeight.Medium, fontSize = 22.sp)
)

@Composable
fun ReceptionTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = ColorScheme,
        typography = AppTypography,
        content = content
    )
}
