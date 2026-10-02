package com.officereception.app.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class FormValidatorTest {
    @Test
    fun requiredTrimsAndRejectsBlank() {
        assertEquals("山田", FormValidator.required(" 山田 "))
        assertNull(FormValidator.required("   "))
    }

    @Test
    fun partySizeAcceptsOneToNinetyNine() {
        assertEquals(1, FormValidator.partySize("1"))
        assertEquals(99, FormValidator.partySize("99"))
        assertNull(FormValidator.partySize("0"))
        assertNull(FormValidator.partySize("100"))
        assertNull(FormValidator.partySize("abc"))
        assertNull(FormValidator.partySize("  "))
    }

    @Test
    fun generalCannotProceedUntilAllFieldsAreValid() {
        assertFalse(FormValidator.canSubmitGeneral("", "太郎", "1", "yamada"))
        assertFalse(FormValidator.canSubmitGeneral("A社", "  ", "1", "yamada"))
        assertFalse(FormValidator.canSubmitGeneral("A社", "太郎", "0", "yamada"))
        assertFalse(FormValidator.canSubmitGeneral("A社", "太郎", "2", null))
        assertFalse(FormValidator.canSubmitGeneral("A社", "太郎", "2", ""))
        assertTrue(FormValidator.canSubmitGeneral(" A社 ", " 太郎 ", "2", "yamada"))
    }

    @Test
    fun interviewRequiresPurposeAndName() {
        assertFalse(FormValidator.canSubmitInterview(null, "太郎"))
        assertFalse(FormValidator.canSubmitInterview(InterviewPurpose.Interview, "  "))
        assertTrue(FormValidator.canSubmitInterview(InterviewPurpose.Training, " 太郎 "))
    }
}
