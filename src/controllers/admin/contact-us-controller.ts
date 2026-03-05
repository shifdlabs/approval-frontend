import { ref } from 'vue';

export function contactUsController() {
    const activeIndex = ref<number | null>(null);

    const toggleFAQ = (index: number) => {
    activeIndex.value = activeIndex.value === index ? null : index;
    };

    return {
        activeIndex,
        toggleFAQ,
    }
}
