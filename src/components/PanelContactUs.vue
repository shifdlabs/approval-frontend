<template>
  <VExpansionPanels multiple>
    <VExpansionPanel
      v-for="(faq, index) in faqs"
      :key="index"
    >
      <VExpansionPanelTitle>
        {{ faq.question }}
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        {{ faq.answer }}
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const faqs = ref([
  { question: 'How do I extend my subscription & license?', answer: 'You can extend your subscription by logging into your account and navigating to the subscription section.' },
  { question: 'How do I pay for a new license?', answer: 'We accept Visa®, MasterCard®, American Express®, and PayPal®. Our servers encrypt all information submitted to them, so you can be confident that your credit card information will be kept safe and secure.' },
  { question: "What should I do if I'm having trouble with the license?", answer: 'If you are having trouble with your license, please contact our support team for assistance.' },
  { question: "How do I upgrade my subscription plan or get full access to the license?", answer: 'To upgrade your subscription plan, log into your account and navigate to the subscription section. From there, you can choose the plan that best suits your needs.' },
  { question: "How can I give feedback for Alpha?", answer: 'We value your feedback! Please send us your comments and suggestions through our contact form or email us at support@alpha.com.' }
]);
</script>
