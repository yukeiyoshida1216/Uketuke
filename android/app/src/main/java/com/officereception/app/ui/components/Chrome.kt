package com.officereception.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.officereception.app.config.AppConfig
import com.officereception.app.config.AppLanguage
import com.officereception.app.domain.Destination
import kotlin.math.cos
import kotlin.math.sin

private val SoftShape = RoundedCornerShape(24.dp)
private val ChipShape = RoundedCornerShape(20.dp)
private val PillShape = RoundedCornerShape(50)

@Composable
fun SoftBackground(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        AppConfig.Colors.CreamTop,
                        AppConfig.Colors.CreamCenter,
                        AppConfig.Colors.CreamBottom
                    )
                )
            )
    ) {
        content()
    }
}

@Composable
fun LanguageToggle(
    language: AppLanguage,
    onLanguageChange: (AppLanguage) -> Unit,
    copy: AppConfig.Copy,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        PillButton(
            text = copy.langJa,
            selected = language == AppLanguage.Japanese,
            onClick = { onLanguageChange(AppLanguage.Japanese) }
        )
        PillButton(
            text = copy.langEn,
            selected = language == AppLanguage.English,
            onClick = { onLanguageChange(AppLanguage.English) }
        )
    }
}

@Composable
fun PillButton(
    text: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val shape = PillShape
    Box(
        modifier = modifier
            .shadow(
                elevation = if (selected) 4.dp else 2.dp,
                shape = shape,
                spotColor = Color(0x33000000),
                ambientColor = Color(0x1A000000)
            )
            .clip(shape)
            .background(if (selected) AppConfig.Colors.Accent else AppConfig.Colors.Card)
            .then(
                if (selected) {
                    Modifier
                } else {
                    Modifier.border(1.5.dp, AppConfig.Colors.AccentBorder, shape)
                }
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 18.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = if (selected) AppConfig.Colors.White else AppConfig.Colors.Ink,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun BackChip(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val shape = RoundedCornerShape(18.dp)
    Box(
        modifier = modifier
            .shadow(4.dp, shape, spotColor = Color(0x28000000), ambientColor = Color(0x14000000))
            .clip(shape)
            .background(AppConfig.Colors.Card)
            .border(1.5.dp, AppConfig.Colors.AccentBorder, shape)
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = AppConfig.Colors.Ink,
            fontSize = 18.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun SoftCard(
    title: String,
    subtitle: String,
    icon: MenuIconKind,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .shadow(8.dp, SoftShape, spotColor = Color(0x2E000000), ambientColor = Color(0x18000000))
            .clip(SoftShape)
            .background(AppConfig.Colors.Card)
            .border(1.5.dp, AppConfig.Colors.AccentBorder, SoftShape)
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        MenuIcon(kind = icon, modifier = Modifier.size(72.dp))
        Spacer(modifier = Modifier.height(18.dp))
        Text(
            text = title,
            color = AppConfig.Colors.Ink,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = subtitle,
            color = AppConfig.Colors.InkMuted,
            fontSize = 14.sp,
            textAlign = TextAlign.Center,
            lineHeight = 20.sp
        )
    }
}

@Composable
fun SoftTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    keyboardType: KeyboardType = KeyboardType.Text
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = label,
            color = AppConfig.Colors.Ink,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium
        )
        Spacer(modifier = Modifier.height(8.dp))
        val shape = RoundedCornerShape(18.dp)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(4.dp, shape, spotColor = Color(0x22000000), ambientColor = Color(0x12000000))
                .clip(shape)
                .background(AppConfig.Colors.Card)
                .border(1.5.dp, AppConfig.Colors.AccentBorder, shape)
                .padding(horizontal = 18.dp, vertical = 16.dp)
        ) {
            if (value.isEmpty()) {
                Text(
                    text = placeholder,
                    color = AppConfig.Colors.InkMuted.copy(alpha = 0.65f),
                    fontSize = 20.sp
                )
            }
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
                textStyle = TextStyle(
                    fontSize = 20.sp,
                    color = AppConfig.Colors.Ink
                ),
                cursorBrush = SolidColor(AppConfig.Colors.Accent),
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
fun ChoiceChip(
    text: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val shape = ChipShape
    Box(
        modifier = modifier
            .shadow(
                elevation = if (selected) 6.dp else 3.dp,
                shape = shape,
                spotColor = Color(0x28000000),
                ambientColor = Color(0x14000000)
            )
            .clip(shape)
            .background(
                if (selected) AppConfig.Colors.Accent.copy(alpha = 0.18f) else AppConfig.Colors.Card
            )
            .border(
                width = if (selected) 2.dp else 1.5.dp,
                color = if (selected) AppConfig.Colors.Accent else AppConfig.Colors.AccentBorder,
                shape = shape
            )
            .clickable(onClick = onClick)
            .heightIn(min = 64.dp)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = AppConfig.Colors.Ink,
            fontSize = 20.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun SubmitButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    val shape = RoundedCornerShape(22.dp)
    Box(
        modifier = modifier
            .fillMaxWidth()
            .shadow(
                elevation = if (enabled) 8.dp else 2.dp,
                shape = shape,
                spotColor = Color(0x33000000),
                ambientColor = Color(0x18000000)
            )
            .clip(shape)
            .background(
                if (enabled) AppConfig.Colors.Accent else AppConfig.Colors.Accent.copy(alpha = 0.4f)
            )
            .clickable(enabled = enabled, onClick = onClick)
            .heightIn(min = 64.dp)
            .padding(horizontal = 24.dp, vertical = 16.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = AppConfig.Colors.White,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun DeliveryShortcut(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val shape = RoundedCornerShape(28.dp)
    Column(
        modifier = modifier
            .shadow(8.dp, shape, spotColor = Color(0x2E000000), ambientColor = Color(0x18000000))
            .clip(shape)
            .background(AppConfig.Colors.Card)
            .border(2.dp, AppConfig.Colors.AccentBorder, shape)
            .clickable(
                indication = null,
                interactionSource = remember { MutableInteractionSource() },
                onClick = onClick
            )
            .padding(horizontal = 22.dp, vertical = 28.dp)
            .width(120.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        BellIcon(modifier = Modifier.size(48.dp))
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = label,
            color = AppConfig.Colors.Accent,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun BrandLogo(modifier: Modifier = Modifier, size: Dp = 88.dp) {
    val accent = AppConfig.Colors.Accent
    Canvas(modifier = modifier.size(size)) {
        val cx = this.size.width / 2f
        val cy = this.size.height / 2f
        val hub = this.size.minDimension * 0.12f
        drawCircle(color = accent, radius = hub, center = Offset(cx, cy))
        val orbit = this.size.minDimension * 0.32f
        val figureR = this.size.minDimension * 0.09f
        for (i in 0 until 6) {
            val angle = Math.toRadians(-90.0 + i * 60.0)
            val fx = cx + (orbit * cos(angle)).toFloat()
            val fy = cy + (orbit * sin(angle)).toFloat()
            drawCircle(color = accent, radius = figureR * 0.45f, center = Offset(fx, fy - figureR * 0.55f))
            val body = Path().apply {
                moveTo(fx, fy - figureR * 0.15f)
                quadraticTo(fx - figureR * 0.9f, fy + figureR * 0.4f, fx - figureR * 0.55f, fy + figureR * 1.1f)
                lineTo(fx + figureR * 0.55f, fy + figureR * 1.1f)
                quadraticTo(fx + figureR * 0.9f, fy + figureR * 0.4f, fx, fy - figureR * 0.15f)
                close()
            }
            drawPath(body, color = accent)
            val handAngle = angle + Math.PI
            val hx = cx + (hub * 1.6f * cos(handAngle)).toFloat()
            val hy = cy + (hub * 1.6f * sin(handAngle)).toFloat()
            drawLine(
                color = accent,
                start = Offset(fx, fy),
                end = Offset(hx, hy),
                strokeWidth = figureR * 0.28f,
                cap = StrokeCap.Round
            )
        }
    }
}

@Composable
fun CornerMark(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .size(36.dp)
            .clip(CircleShape)
            .background(AppConfig.Colors.Ink),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "N",
            color = AppConfig.Colors.White,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

enum class MenuIconKind {
    Business,
    Interview,
    Other
}

@Composable
fun MenuIcon(kind: MenuIconKind, modifier: Modifier = Modifier) {
    val accent = AppConfig.Colors.Accent
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        when (kind) {
            MenuIconKind.Business -> {
                fun person(cx: Float, cy: Float, s: Float) {
                    drawCircle(accent, radius = s * 0.22f, center = Offset(cx, cy - s * 0.35f))
                    val body = Path().apply {
                        moveTo(cx, cy - s * 0.1f)
                        quadraticTo(cx - s * 0.45f, cy + s * 0.1f, cx - s * 0.35f, cy + s * 0.55f)
                        lineTo(cx + s * 0.35f, cy + s * 0.55f)
                        quadraticTo(cx + s * 0.45f, cy + s * 0.1f, cx, cy - s * 0.1f)
                        close()
                    }
                    drawPath(body, accent)
                }
                person(w * 0.32f, h * 0.58f, w * 0.42f)
                person(w * 0.68f, h * 0.58f, w * 0.42f)
                val bubble = Path().apply {
                    addOval(
                        androidx.compose.ui.geometry.Rect(
                            left = w * 0.38f,
                            top = h * 0.08f,
                            right = w * 0.72f,
                            bottom = h * 0.38f
                        )
                    )
                }
                drawPath(bubble, accent)
                drawCircle(Color.White, radius = w * 0.025f, center = Offset(w * 0.48f, h * 0.22f))
                drawCircle(Color.White, radius = w * 0.025f, center = Offset(w * 0.55f, h * 0.22f))
                drawCircle(Color.White, radius = w * 0.025f, center = Offset(w * 0.62f, h * 0.22f))
            }
            MenuIconKind.Interview -> {
                fun person(cx: Float, cy: Float, s: Float) {
                    drawCircle(accent, radius = s * 0.18f, center = Offset(cx, cy - s * 0.28f))
                    drawRoundRect(
                        color = accent,
                        topLeft = Offset(cx - s * 0.28f, cy - s * 0.05f),
                        size = Size(s * 0.56f, s * 0.45f),
                        cornerRadius = CornerRadius(s * 0.12f, s * 0.12f)
                    )
                }
                person(w * 0.28f, h * 0.48f, w * 0.38f)
                person(w * 0.5f, h * 0.42f, w * 0.38f)
                person(w * 0.72f, h * 0.48f, w * 0.38f)
                drawRoundRect(
                    color = accent,
                    topLeft = Offset(w * 0.18f, h * 0.72f),
                    size = Size(w * 0.64f, h * 0.1f),
                    cornerRadius = CornerRadius(4f, 4f)
                )
                drawOval(
                    color = accent,
                    topLeft = Offset(w * 0.58f, h * 0.05f),
                    size = Size(w * 0.28f, h * 0.22f)
                )
            }
            MenuIconKind.Other -> {
                drawRoundRect(
                    color = accent,
                    topLeft = Offset(w * 0.18f, h * 0.22f),
                    size = Size(w * 0.52f, h * 0.58f),
                    cornerRadius = CornerRadius(8f, 8f)
                )
                drawRoundRect(
                    color = Color.White,
                    topLeft = Offset(w * 0.26f, h * 0.18f),
                    size = Size(w * 0.36f, h * 0.1f),
                    cornerRadius = CornerRadius(4f, 4f)
                )
                for (row in 0 until 2) {
                    for (col in 0 until 3) {
                        drawCircle(
                            color = Color.White,
                            radius = w * 0.035f,
                            center = Offset(w * (0.3f + col * 0.12f), h * (0.42f + row * 0.16f))
                        )
                    }
                }
                val gx = w * 0.72f
                val gy = h * 0.72f
                val gr = w * 0.14f
                drawCircle(color = accent, radius = gr, center = Offset(gx, gy), style = Stroke(width = w * 0.06f))
                drawCircle(color = accent, radius = gr * 0.35f, center = Offset(gx, gy))
                for (i in 0 until 6) {
                    val a = Math.toRadians(i * 60.0)
                    val inner = gr * 0.85f
                    val outer = gr * 1.35f
                    drawLine(
                        color = accent,
                        start = Offset(gx + (inner * cos(a)).toFloat(), gy + (inner * sin(a)).toFloat()),
                        end = Offset(gx + (outer * cos(a)).toFloat(), gy + (outer * sin(a)).toFloat()),
                        strokeWidth = w * 0.055f,
                        cap = StrokeCap.Round
                    )
                }
            }
        }
    }
}

@Composable
private fun BellIcon(modifier: Modifier = Modifier) {
    val accent = AppConfig.Colors.Accent
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        val path = Path().apply {
            moveTo(w * 0.22f, h * 0.38f)
            quadraticTo(w * 0.22f, h * 0.18f, w * 0.5f, h * 0.16f)
            quadraticTo(w * 0.78f, h * 0.18f, w * 0.78f, h * 0.38f)
            lineTo(w * 0.78f, h * 0.58f)
            quadraticTo(w * 0.9f, h * 0.7f, w * 0.9f, h * 0.76f)
            lineTo(w * 0.1f, h * 0.76f)
            quadraticTo(w * 0.1f, h * 0.7f, w * 0.22f, h * 0.58f)
            close()
        }
        drawPath(path, accent)
        drawCircle(accent, radius = w * 0.08f, center = Offset(w * 0.5f, h * 0.12f))
        drawArc(
            color = accent,
            startAngle = 0f,
            sweepAngle = 180f,
            useCenter = true,
            topLeft = Offset(w * 0.38f, h * 0.78f),
            size = Size(w * 0.24f, h * 0.16f)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SoftDropdown(
    label: String,
    placeholder: String,
    destinations: List<Destination>,
    selectedDestinationId: String?,
    onDestinationSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }
    val selectedLabel = destinations
        .firstOrNull { it.id == selectedDestinationId }
        ?.displayName
        .orEmpty()
    val shape = RoundedCornerShape(18.dp)

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = label,
            color = AppConfig.Colors.Ink,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium
        )
        Spacer(modifier = Modifier.height(8.dp))
        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { expanded = it },
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                    .fillMaxWidth()
                    .shadow(4.dp, shape, spotColor = Color(0x22000000), ambientColor = Color(0x12000000))
                    .clip(shape)
                    .background(AppConfig.Colors.Card)
                    .border(1.5.dp, AppConfig.Colors.AccentBorder, shape)
                    .padding(horizontal = 18.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = selectedLabel.ifEmpty { placeholder },
                    color = if (selectedLabel.isEmpty()) {
                        AppConfig.Colors.InkMuted.copy(alpha = 0.65f)
                    } else {
                        AppConfig.Colors.Ink
                    },
                    fontSize = 20.sp,
                    modifier = Modifier.weight(1f)
                )
                ChevronDown(modifier = Modifier.size(20.dp))
            }
            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false },
                modifier = Modifier.background(AppConfig.Colors.Card)
            ) {
                destinations.forEach { destination ->
                    DropdownMenuItem(
                        text = {
                            Text(
                                text = destination.displayName,
                                fontSize = 20.sp,
                                color = AppConfig.Colors.Ink
                            )
                        },
                        onClick = {
                            onDestinationSelected(destination.id)
                            expanded = false
                        },
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun ChevronDown(modifier: Modifier = Modifier) {
    val accent = AppConfig.Colors.Accent
    Canvas(modifier = modifier) {
        val path = Path().apply {
            moveTo(size.width * 0.15f, size.height * 0.35f)
            lineTo(size.width * 0.5f, size.height * 0.7f)
            lineTo(size.width * 0.85f, size.height * 0.35f)
        }
        drawPath(
            path = path,
            color = accent,
            style = Stroke(width = size.width * 0.14f, cap = StrokeCap.Round)
        )
    }
}
