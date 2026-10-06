package com.officereception.app.data

import com.officereception.app.config.AppConfig
import com.officereception.app.domain.Destination
import com.officereception.app.domain.NotifyPayload
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class ReceptionRepository(
    private val baseUrl: String = AppConfig.Network.apiBaseUrl,
    private val client: OkHttpClient = defaultClient()
) {
    fun fetchDestinations(): List<Destination> {
        val request = Request.Builder()
            .url(join(baseUrl, "destinations"))
            .get()
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw ReceptionException("destinations failed: ${response.code}")
            }
            val body = response.body?.string().orEmpty()
            val array = JSONObject(body).getJSONArray("destinations")
            return parseDestinations(array)
        }
    }

    fun notify(payload: NotifyPayload, idempotencyKey: String) {
        val request = Request.Builder()
            .url(join(baseUrl, "notify"))
            .post(payload.toJson(idempotencyKey).toRequestBody(JSON))
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw ReceptionException("notify failed: ${response.code}")
            }
        }
    }

    private fun parseDestinations(array: JSONArray): List<Destination> {
        return buildList {
            for (index in 0 until array.length()) {
                val item = array.getJSONObject(index)
                add(
                    Destination(
                        id = item.getString("id"),
                        displayName = item.getString("displayName")
                    )
                )
            }
        }
    }

    companion object {
        private val JSON = "application/json; charset=utf-8".toMediaType()

        fun defaultClient(): OkHttpClient {
            val timeout = AppConfig.Timing.NETWORK_TIMEOUT_MS
            return OkHttpClient.Builder()
                .connectTimeout(timeout, TimeUnit.MILLISECONDS)
                .readTimeout(timeout, TimeUnit.MILLISECONDS)
                .writeTimeout(timeout, TimeUnit.MILLISECONDS)
                .callTimeout(timeout, TimeUnit.MILLISECONDS)
                .retryOnConnectionFailure(false)
                .build()
        }

        fun join(baseUrl: String, path: String): String {
            val normalized = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"
            return normalized + path.trimStart('/')
        }
    }
}

class ReceptionException(message: String) : RuntimeException(message)
