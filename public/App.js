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
        description: 'Description of event 3, which is a bit longer than event 1 so that it breaks across multiple lines Description of event 3, which is a bit longer than event 1 so that it breaks across multiple lines Description of event 3, which is a bit longer than event 1 so that it breaks across multiple lines',
        date: '3/8/24',
        startTime: '12pm',
        endTime: '5pm',
        location: 'Adelaide',
        image_url: '/not_an_image.png'
    }
];

const testBranchSummary = [
    {
        id: 1,
        name: 'Adelaide'
    },
    {
        id: 2,
        name: 'Sydney'
    },
    {
        id: 3,
        name: 'Melbourne'
    },
]

createApp({
data() {
    return {
        message: 'Hello Vue!',
        navitems: navitems,
        logged_in: false,
        events_results: testEvents,
        show_events_filters: false,
        branches_summary: testBranchSummary
    };
},
methods: {
    events_search() {
        // Get the value of all the relevant filter options and search term
        let search_term = document.getElementById("events-search").value;
        let from_date = document.getElementById("from-date").value;
        let to_date = document.getElementById("to-date").value;
        let num_events = document.getElementById("num-events").value;
        // do branches as well

        console.log("search term: " + search_term);
        console.log("from date: " + from_date);
        console.log("to date: " + to_date);
        console.log("num events: " + num_events);
    }
}
}).mount('#app');