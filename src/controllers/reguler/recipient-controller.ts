import { ref } from 'vue';

// Definisikan tipe data untuk item
interface InboxItem {
  id: string;
  subject: string;
  body: string;
  createdAt: string;
  receiveAt: string; 
  updatedAt: string;
}

export function useRecipientController() {
  const inboxList = ref<InboxItem[]>([]);
  const isLoading = ref(false);

  const { data, error, execute } = useApi(
    'document/inbox',
    { method: 'GET' },
    { immediate: false }
  );

  const fetchInbox = async () => {
    isLoading.value = true;

    await execute();

    if (!error.value && (data.value as any)?.success) {
      const res = data.value as any;
      inboxList.value = res.data.map((item: InboxItem) => ({
        id: item.id,
        subject: item.subject,
        body: item.body,
        createdAt: item.createdAt,
        receiveAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
    } else if (error.value) {
      console.error('Error fetching inbox data:', error.value);
    }

    isLoading.value = false;
  };

  return {
    inboxList,
    isLoading,
    fetchInbox,
  };
}
