const role = Number(useCookie('role').value);

export default [
  ...(role === 1
    ? [
        { heading: "nav.main" },
        {
          title: 'nav.dashboard',
          to: { name: 'reguler-dashboard' },
          icon: { icon: 'tabler-home-2' },
        },
        {
          title: 'nav.inbox',
          to: { name: 'reguler-inbox' },
          icon: { icon: 'tabler-inbox' },
        },
        {
          title: 'nav.starred',
          to: { name: 'reguler-bookmark' },
          icon: { icon: 'tabler-star' },
        },
        {
          title: 'nav.myBookings',
          to: { name: 'reguler-booking' },
          icon: { icon: 'tabler-sort-descending-2' },
        },
        { heading: "nav.indexes" },
        {
          title: 'nav.authorization',
          to: { name: 'reguler-authorization' },
          icon: { icon: 'tabler-clipboard-check' },
        },
        {
          title: 'nav.inProgress',
          to: { name: 'reguler-progress' },
          icon: { icon: 'tabler-mail-up' },
        },
         {
          title: 'nav.draft',
          to: { name: 'reguler-draft' },
          icon: { icon: 'tabler-file-description' },
        },
        {
          title: 'nav.rejected',
          to: { name: 'reguler-rejected' },
          icon: { icon: 'tabler-mail-x' },
        },
        {
          title: 'nav.complete',
          to: { name: 'reguler-complete' },
          icon: { icon: 'tabler-mail-check' },
        },
        { heading: "nav.delegation" },
        {
          title: 'nav.delegation',
          to: { name: 'reguler-delegation' },
          icon: { icon: 'tabler-user-share' },
        }
      ]
    : role === 99
    ? [
        { heading: "nav.indexes" },
        {
          title: 'nav.users',
          to: { name: 'admin-users' },
          icon: { icon: 'tabler-users-group' },
        },
        {
          title: 'nav.jobPositions',
          to: { name: 'admin-positions' },
          icon: { icon: 'tabler-subtask' },
        },
        {
          title: 'nav.allDocuments',
          to: { name: 'admin-approvals' },
          icon: { icon: 'tabler-mail' },
        },
        {
          title: 'nav.actionHistories',
          to: { name: 'admin-histories' },
          icon: { icon: 'tabler-history' },
        },
        { heading: "nav.systemSettings" },
        {
          title: 'nav.documentNumbers',
          to: { name: 'admin-document-numbers' },
          icon: { icon: 'tabler-sort-descending-2' },
        },
        {
          title: 'nav.letterhead',
          to: { name: 'admin-letterhead' },
          icon: { icon: 'tabler-mail-code' },
        },
        {
          title: 'nav.generalSettings',
          to: { name: 'admin-general-settings' },
          icon: { icon: 'tabler-settings' },
        },
        {
          title: 'nav.appLogs',
          to: { name: 'admin-app-log' },
          icon: { icon: 'tabler-history-toggle' },
        },
        { heading: "nav.support" },
        {
          title: 'nav.contactUs',
          to: { name: 'admin-contactus' },
          icon: { icon: 'tabler-phone-call' },
        },
        // {
        //   title: 'Upload',
        //   to: { name: 'reguler-upload' },
        //   icon: { icon: 'tabler-cloud-upload' },
        // },
        // {
        //   title: 'Preview',
        //   to: { name: 'reguler-preview' },
        //   icon: { icon: 'tabler-eye' },
        // }
      ]
    : []), // Jika role tidak sesuai, tampilkan menu kosong
];
