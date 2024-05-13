const { createApp } = Vue;

const navitems = [
    { title:'Home',         url:'/' },
    { title:'Events',   url:'/events' },
    { title:'About',        url:'/about' },
    { title:'Branches',   url:'/branches' },
    { title:'Login', url:'/login'}
];

const testEvents = [
    {
        title: 'Event 1 Title',
        description: 'Description of event 1',
        date: '1/7/24',
        startTime: '1pm',
        endTime: '3pm',
        location: 'Adelaide',
        image_url: '/not_an_image.png'
    },
    {
        title: 'Event 2 Title',
        description: 'Description of event 2, which is a bit longer than event 1 so that it breaks across multiple lines',
        date: '3/7/24',
        startTime: '12pm',
        endTime: '5pm',
        location: 'Sydney',
        image_url: '/not_an_image.png'
    },
    {
        title: 'Event 3 Title',
        description: 'Description of event 3, which is a bit longer than event 1 so that it breaks across multiple lines',
        date: '3/8/24',
        startTime: '12pm',
        endTime: '5pm',
        location: 'Adelaide',
        image_url: '/not_an_image.png'
    }
];

createApp({
data() {
    return {
        message: 'Hello Vue!',
        navitems: navitems,
        logged_in: false,
        events_results: testEvents,
        show_events_filters: false
    };
}
}).mount('#app');