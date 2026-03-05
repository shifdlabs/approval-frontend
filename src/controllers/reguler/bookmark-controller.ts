import { ref } from 'vue';

// Definisikan tipe data untuk item
interface BookmarkItem {
  id: string;
  subject: string;
  body: string;
  createdAt: string;
  receiveAt: string;
}

export function useBookmarkController() {
  const bookmarkList = ref<BookmarkItem[]>([]);
  const isLoading = ref(false);

  // Ambil ID pengguna dari cookie
const fetchBookmarks = async () => {
  isLoading.value = true
  try {

    const { data, error } = await useApi<{
      success: boolean
      data: {
        ID: string
        Subject: string
        Body: string
        CreatedAt: string
      }[]
    }>(`/bookmark/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (error.value) {
      console.error('Error fetching bookmarks:', error.value)
      return
    }

    if (data.value?.success) {
      bookmarkList.value = data.value.data.map(item => ({
        id: item.ID,
        subject: item.Subject,
        body: item.Body,
        createdAt: item.CreatedAt,
        receiveAt: item.CreatedAt,
      }))
    }
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
  } finally {
    isLoading.value = false
  }
}

  return {
    bookmarkList,
    isLoading,
    fetchBookmarks,
  };
}
