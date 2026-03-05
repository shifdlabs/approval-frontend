import { Position } from '@/models/positions/position';
import { ChangePassword } from '@/models/users/change.password';
import { ConfirmationDialogData } from '@/models/users/confirmation.dialog';
import { User } from '@/models/users/users';
import { computed, ref } from 'vue';
 
export function usersController() {
    onMounted(() => {
        fetchUsers()
        fetchPositions()
      })
 
      // ====> Data Stores
      const usersList = ref<User[]>([])
      const selected = ref<User[]>([])
      const positions = ref<Position[]>([])
      const isRefetchList = ref(false)
      const changeUserPassword = ref<ChangePassword>()
      const selectedUser = ref<User>()
      let confirmationDialogData = ref<ConfirmationDialogData>({
        title: '',
        body: '',
        buttonTitle: '',
        type: 0
      })
 
      const accessTypeValue = ref([
        { value: true, title: 'Active' },
        { value: false, title: 'Disabled' },
      ])
 
      const roleTypeValue = ref([
        { value: 1, title: 'Reguler' },
        { value: 99, title: 'Admin' },
      ])
 
      const searchQuery = ref('')
      const filteredPosition = ref(null)
      const filteredAccess = ref(null)
      const filteredRole = ref(null)
      const filteredUsers = computed(() => {
        return usersList.value.filter(user => {
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
          const nameMatch =
            !searchQuery.value ||
            fullName.includes(searchQuery.value.toLowerCase())
          const positionMatch =
            !filteredPosition.value ||
            user.position.id == filteredPosition.value
 
          const roleMatch = !filteredRole.value || user.role == filteredRole.value
          const accessMatch = !filteredAccess.value || user.access == filteredAccess.value
          // Both conditions must be true:
          return nameMatch && positionMatch && roleMatch && accessMatch
        })
      })
 
      // ===> Dialog States
      const isCreateUserDialogVisible = ref(false)
      const isChangePasswordDialogVisible = ref(false)
      const isConfirmationDialogVisible = ref(false)
      const isDetailUserDialogVisible = ref(false)
      const isUpdateUserDialogVisible = ref(false)
      const isFilterSectionVisible = ref(false)
 
      // ====> Table Configuration
      const headers = [
        { title: 'ID', key: 'id' },
        { title: 'NAME', key: 'name' },
        { title: 'EMAIL', key: 'email' },
        { title: 'POSITION', key: 'position' },
        { title: 'ROLE', key: 'role' },
        { title: 'ACCESS', key: 'access' },
        { title: 'ACTION', key: 'actions' },
      ]
 
      const userRole = (value: number) => {
        if (value === 1)
          return { color: 'secondary', text: 'Reguler' }
        else if (value === 99)
          return { color: 'primary', text: 'Admin' }
        else
          return { color: 'info', text: '-' }
      }
 
      const accessType = (hasAccess: boolean) => {
        if (hasAccess)
          return { color: 'success', text: 'Active' }
        else
          return { color: 'error', text: 'Disabled' }
      }
 
      const onRowClicked = (item: User) => {
        console.log(`Tess ${item.id}`)
        selectedUser.value = item
        isDetailUserDialogVisible.value = true
      }
 
      // ====> Filter Content
      const onTapFilter = () => {
        filteredPosition.value = null
        filteredAccess.value = null
        filteredRole.value = null
        isFilterSectionVisible.value = !isFilterSectionVisible.value
      }
 
      // ====> Edit Item
 
      const editItem = (item: User) => {
        selectedUser.value = item
        isUpdateUserDialogVisible.value = true
      }
 
      // ===> Change Password
      const changePassword = (item: User) => {
        const selectedUser: ChangePassword = ({
          id: item.id,
          email: item.email
        })
 
        changeUserPassword.value = selectedUser
        isChangePasswordDialogVisible.value = true
      }
 
      // ===> Delete User
 
      const showDeleteUserDialog = (item: User) => {
        confirmationDialogData.value = ({
          title: `Are you sure want to delete user of ${ item.email }?`,
          body: 'Once you have deleted all user data cannot be recovery back.',
          buttonTitle: 'Delete',
          type: 3
        })
 
        selectedUser.value = item
        isConfirmationDialogVisible.value = true
      }
 
      const showDeleteMultipleUserDialog = () => {
        confirmationDialogData.value = ({
          title: `Are you sure want to delete ${selected.value.length} users?`,
          body: 'Once you have deleted it the user data cannot be recovery back.',
          buttonTitle: 'Delete All',
          type: 4
        })
 
        isConfirmationDialogVisible.value = true
      }
 
      const deleteItem = async () => {
        try {
          const { error } = await useApi(`/user/${selectedUser.value?.id}`, {
            method: 'DELETE',
          })

          if (error.value) {
            console.log('Delete error:', error.value)
            return
          }

          const index = usersList.value.findIndex(
            (user) => user.id === selectedUser.value?.id
          )
          if (index !== -1) {
            usersList.value.splice(index, 1)
          }

          isConfirmationDialogVisible.value = false
        } catch (e) {
          console.log('Unexpected error:', e)
        }
      }
 
      const deleteMultipleUsers = async () => {
        try {
          const selectedIds = selected.value.map(id => String(id))

          const { data, error } = await useApi('/user/deletes', {
            method: 'DELETE',
            body: JSON.stringify({ ids: selectedIds }),
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })

          if (error.value) {
            console.error(error.value)
            return
          }

          isConfirmationDialogVisible.value = false
          refetchList()
        } catch (e) {
          console.error(e)
        }
      }
 
      // ==========> Role
 
      const showChangeRoleDialog = (item: User) => {
        confirmationDialogData.value = ({
          title: `Are you sure want to change the role to ${ item.role == 99 ? "Reguler User" : "Admin" }?`,
          body: 'The role changes will be impacting the accesibility for the app.',
          buttonTitle: 'Yes, Change Role',
          type: 1
        })
 
        selectedUser.value = item
        isConfirmationDialogVisible.value = true
      }
 
      const changeRole = async () => {
        try {
          const { data, error } = await useApi('/user/role', {
            method: 'PUT',
            body: JSON.stringify({
              id: selectedUser.value?.id,
              role: selectedUser.value?.role == 99 ? 1 : 99,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })

          if (error.value) {
            console.error(error.value)
            return
          }

          const user = usersList.value.find(user => user.id === selectedUser.value?.id)
          if (user) {
            user.role = selectedUser.value?.role == 99 ? 1 : 99
            isConfirmationDialogVisible.value = false
          }
        } catch (e) {
          console.error(e)
        }
      }
 
      // ==========> Access
 
      const showChangeAcceessDialog = (item: User) => {
        confirmationDialogData.value = ({
          title: `Are you sure want to change the access of user to ${ item.access == true ? "Disabled" : "Active" }?`,
          body: 'The access changes will be impacting the accesibility for the app.',
          buttonTitle: 'Yes, Change Access',
          type: 2
        })
 
        selectedUser.value = item
        isConfirmationDialogVisible.value = true
      }
 
      const changeAccess = async () => {
        try {
          const { data, error } = await useApi('/user/access', {
            method: 'PUT',
            body: JSON.stringify({
              id: selectedUser.value?.id,
              access: selectedUser.value?.access === true ? false : true,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })

          if (error.value) {
            console.error(error.value)
            return
          }

          const user = usersList.value.find(user => user.id === selectedUser.value?.id)
          if (user) {
            user.access = selectedUser.value?.access === true ? false : true
          }

          isConfirmationDialogVisible.value = false
        } catch (e) {
          console.error(e)
        }
      }
 
      // ==========> Initialize Index Data
 
      const fetchUsers = async () => {
        try {
          const res = await useApi('/user', {
            method: 'GET'
          })
 
          console.log(res.data.value)
          const value = res.data.value as { data: any };
          usersList.value = value.data.map((user: any) => mapUser(user));
        } catch (e) {
          console.log(e)
        }
      }
 
      const fetchPositions = async () => {
        try {
          const res = await useApi('/position', {
            method: 'GET'
          })
 
          console.log(res.data.value)
          const value = res.data.value as { data: any }
          positions.value = JSON.parse(JSON.stringify(value.data))
        } catch (e) {
          console.log(e)
        }
      }
 
      const refetchList = async () => {
        if (isRefetchList) {
          fetchUsers()
        }
      }
 
      // ===> User Data Response Mapper
 
      const mapPosition = (rawPosition: any): Position => {
        return {
          id: rawPosition.ID,     // mapping 'ID' from response to 'id'
          name: rawPosition.Name  // mapping 'Name' from response to 'name'
        };
      };
 
      const mapUser = (rawUser: any): User => {
        return {
          ...rawUser,
          // override the position property with our mapped version
          position: mapPosition(rawUser.position)
        };
      };
 
      return {
        usersList,
        selected,
        positions,
        isRefetchList,
        changeUserPassword,
        selectedUser,
        confirmationDialogData,
        accessTypeValue,
        roleTypeValue,
        searchQuery,
        filteredPosition,
        filteredAccess,
        filteredRole,
        filteredUsers,
        isCreateUserDialogVisible,
        isChangePasswordDialogVisible,
        isConfirmationDialogVisible,
        isDetailUserDialogVisible,
        isUpdateUserDialogVisible,
        isFilterSectionVisible,
        headers,
        refetchList,
        userRole,
        accessType,
        onRowClicked,
        onTapFilter,
        editItem,
        changePassword,
        showDeleteUserDialog,
        showDeleteMultipleUserDialog,
        deleteItem,
        deleteMultipleUsers,
        showChangeRoleDialog,
        changeRole,
        showChangeAcceessDialog,
        changeAccess,
      }
}
