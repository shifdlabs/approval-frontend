<script setup lang="ts">
import { contactUsController } from '@/controllers/admin/contact-us-controller';

import emailIcon from '@/assets/images/custom/gmail.png';
import phoneIcon from '@/assets/images/custom/phone-call.png';

const {
  activeIndex,
  toggleFAQ,
} = contactUsController()

</script>

<template>
  <VRow class="match-height">
    <VCol cols="12">
      <AppCardCode
        title="FAQ"
        variant="outlined"
        :code="{ ts: '<template>...</template>', js: '<template>...</template>' }"
        class="custom-card purple-text"
      >
        <PanelContactUs />
      </AppCardCode>
    </VCol>
    <VCol cols="12">
      <div class="text-center mb-6">
        <h2 class="purple-text">Questions</h2>
        <p class="text-lg">You still have questions?</p>
        <p>If you cannot find a question in our FAQ, you can contact us.</p>
      </div>
      <div class="d-flex justify-center mb-6">
        <div class="text-center mx-4">
          <img :src="phoneIcon" alt="Phone Icon" height="48" />
          <p class="text-lg font-bold purple-text">Phone</p>
          <p>+1 234 567 890</p>
        </div>
        <div class="text-center mx-4">
          <img :src="emailIcon" alt="Email Icon" height="48" />
          <p class="text-lg font-bold purple-text">Email</p>
          <p>support@example.com</p>
        </div>
      </div>
    </VCol>
  </VRow>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.text-center {
  text-align: center;
}
.mb-6 {
  margin-bottom: 1.5rem;
}
.mx-4 {
  margin-left: 1rem;
  margin-right: 1rem;
}
.purple-text {
  color: #7367F0;
}
.custom-card {
  height: 80%;
}
</style>
