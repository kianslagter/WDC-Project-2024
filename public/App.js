const { createApp } = Vue;

const navitems = [
    { title:'Home',         url:'/' },
    { title:'Events',   url:'/events' },
    { title:'About',        url:'/about' },
    { title:'Branches',   url:'/branches' },
    { title:'Login', url:'/login'}
];

createApp({
data() {
    return {
        message: 'Hello Vue!',
        navitems: navitems
    };
}
}).mount('#app');