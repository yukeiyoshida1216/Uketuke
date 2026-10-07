package com.officereception.app.domain

data class Destination(
    val id: String,
    val displayName: String
)

enum class InterviewPurpose(val apiValue: String) {
    Interview("interview"),
    Training("training")
}

sealed class NotifyPayload {
    abstract val type: String
    abstract fun fingerprint(): String
    abstract fun toJson(idempotencyKey: String): String

    data class General(
        val companyName: String,
        val visitorName: String,
        val partySize: Int,
        val destinationId: String
    ) : NotifyPayload() {
        override val type: String = "general"

        override fun fingerprint(): String {
            return "general|$companyName|$visitorName|$partySize|$destinationId"
        }

        override fun toJson(idempotencyKey: String): String {
            return """{"type":"general","companyName":${jsonString(companyName)},"visitorName":${jsonString(visitorName)},"partySize":$partySize,"destinationId":${jsonString(destinationId)},"idempotencyKey":${jsonString(idempotencyKey)}}"""
        }
    }

    data class Interview(
        val purpose: InterviewPurpose,
        val visitorName: String
    ) : NotifyPayload() {
        override val type: String = "interview"

        override fun fingerprint(): String = "interview|${purpose.apiValue}|$visitorName"

        override fun toJson(idempotencyKey: String): String {
            return """{"type":"interview","purpose":${jsonString(purpose.apiValue)},"visitorName":${jsonString(visitorName)},"idempotencyKey":${jsonString(idempotencyKey)}}"""
        }
    }

    data object Delivery : NotifyPayload() {
        override val type: String = "delivery"
        override fun fingerprint(): String = "delivery"
        override fun toJson(idempotencyKey: String): String =
            """{"type":"delivery","idempotencyKey":${jsonString(idempotencyKey)}}"""
    }

    data object Other : NotifyPayload() {
        override val type: String = "other"
        override fun fingerprint(): String = "other"
        override fun toJson(idempotencyKey: String): String =
            """{"type":"other","idempotencyKey":${jsonString(idempotencyKey)}}"""
    }
}

fun jsonString(value: String): String {
    val escaped = value
        .replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
    return "\"$escaped\""
}
