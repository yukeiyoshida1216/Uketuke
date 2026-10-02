package com.officereception.app.domain

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SubmitGuardTest {
    @Test
    fun blocksDoubleTapAndAllowsRetryAfterFailure() {
        var now = 1_000L
        val guard = SubmitGuard(10_000L) { now }
        val fingerprint = NotifyPayload.Delivery.fingerprint()

        assertTrue(guard.tryBegin(fingerprint))
        assertFalse(guard.tryBegin(fingerprint))

        guard.endFailure()
        assertTrue(guard.tryBegin(fingerprint))
        guard.endSuccess(fingerprint)

        assertFalse(guard.tryBegin(fingerprint))
        now = 12_000L
        assertTrue(guard.tryBegin(fingerprint))
    }

    @Test
    fun generalFingerprintIncludesDestination() {
        val first = NotifyPayload.General("A社", "太郎", 2, "yamada")
        val second = NotifyPayload.General("A社", "太郎", 2, "sato")
        assertTrue(first.fingerprint() != second.fingerprint())
    }

    @Test
    fun interviewFingerprintIncludesPurpose() {
        val interview = NotifyPayload.Interview(InterviewPurpose.Interview, "太郎")
        val training = NotifyPayload.Interview(InterviewPurpose.Training, "太郎")
        assertTrue(interview.fingerprint() != training.fingerprint())
    }
}
