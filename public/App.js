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
        id: 1,
        title: 'Event 1 Title',
        description: 'Description of event 1',
        date: '1/7/24',
        startTime: '1pm',
        endTime: '3pm',
        location: 'Adelaide',
        image_url: '/not_an_image.png'
    },
    {
        id: 2,
        title: 'Event 2 Title',
        description: 'Description of event 2, which is a bit longer than event 1 so that it breaks across multiple lines',
        date: '3/7/24',
        startTime: '12pm',
        endTime: '5pm',
        location: 'Sydney',
        image_url: '/not_an_image.png'
    },
    {
        id: 3,
        title: 'Event 3 Title',
        description: 'Description of event 3, which is a bit longer than event 1 so that it breaks across multiple lines Description of event 3, which is a bit longer than event 1 so that it breaks across multiple lines Description of event 3, which is a bit longer than event 1 so that it breaks across multiple lines',
        date: '3/8/24',
        startTime: '12pm',
        endTime: '5pm',
        location: 'Adelaide',
        image_url: '/not_an_image.png'
    }
];

const testEventDetails = {
    id: 3,
    title: 'Event 3 Title',
    description: 'Description of event 3, which is a bit longer than event 1 so that it breaks across multiple lines Description of event 3, which is a bit longer than event 1 so that it breaks across multiple lines Description of event 3, which is a bit longer than event 1 so that it breaks across multiple lines',
    details: [
        "The first dot point",
        "The second dot point",
        "Could list specific requirements here",
        "Require first aid certificate",
        ["you can even do nested lists", "like", "this", "one", "here"],
        "For more details contact name@organisation.org"
    ],
    date: '3/8/24',
    startTime: '12pm',
    endTime: '5pm',
    location: 'Adelaide',
    image_url: '/not_an_image.png'
};

const testBranchSummary = [
    {
        id: 1,
        name: 'Adelaide',
        location: '129 Waymouth Street, Adelaide SA 5000',
        openingHours: '9am-5pm',
        phone: '0412345678',
        email: 'adelaidebranch@mealmates.com',
        description: 'The Adelaide branch of Meal Mates is located in the heart of the city. This branch has been serving the community for over a decade, providing nutritious meals to those in need. With a dedicated team of volunteers, they work tirelessly to prepare and distribute food. They also collaborate with local farms and businesses to source fresh ingredients, ensuring that every meal is not only filling but also healthy.',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg/320px-11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg',
        page_url: '/branches/adelaidebranch'
    },
    {
        id: 2,
        name: 'Sydney',
        location: '212 York Street, Sydney NSW 2000',
        openingHours: '8am-7pm',
        phone: '0412345678',
        email: 'sydneybranch@mealmates.com',
        description: 'Situated in the bustling city of Sydney, the Meal Mates branch here is known for its large-scale operations. They have a vast network of volunteers who collect surplus food from restaurants, supermarkets, and households, and distribute it to people in need. This branch has made a significant impact in reducing food waste in the city while ensuring that no one goes hungry.',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg/320px-11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg',
        page_url: '/branches/sydneybranch'
    },
    {
        id: 3,
        name: 'Melbourne',
        location: '73 Lonsdale Steet, Melbourne VIC 3000',
        openingHours: '8.30am-4.30pm',
        phone: '0412345678',
        email: 'melbournebranch@mealmates.com',
        description: 'The Melbourne branch of Meal Mates is renowned for its innovative approach to tackling food insecurity. They run community kitchens where people in need are invited to share a meal, fostering a sense of community and belonging. This branch not only provides food relief but also organizes cooking classes and nutrition workshops, empowering individuals to make healthy food choices.',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg/320px-11_Gloddaeth_Street%2C_Llandudno_shop_front.jpg',
        page_url: '/branches/melbournebranch'
    },
];

const testNews = [
    {
        id: 1,
        title: "A longer title for a news article",
        branch: "Adelaide",
        date: "14/5/24",
        article_start: "This is the first few sentences of the article This is the first few sentences of the article This is the first few sentences of the article This is the first few sentences of the article",
        image: "news_image.png"
    },
    {
        id: 2,
        title: "Another successful day for mealmates in Melbourne",
        branch: "Melbourne",
        date: "14/5/24",
        article_start: "This is the first few sentences of the article This is the first few sentences of the article This is the first few sentences of the article This is the first few sentences of the article This is the first few sentences of the article",
        image: "news_image.png"
    },
    {
        id: 3,
        title: "The third news post",
        branch: "Adelaide",
        date: "14/5/24",
        article_start: "This is the first few sentences of the article This is the first few sentences of the article This is the first few sentences of the article This is the first few sentences of the article This is the first few sentences of the article",
        image: "news_image.png"
    },
    {
        id: 4,
        title: "four",
        branch: "adelaide",
        date: "14/5/24",
        article_start: "This is the first few sentences of the article This is the first few sentences of the article This is the first few sentences of the article This is the first few sentences of the article This is the first few sentences of the article",
        image: "news_image.png"
    },
    {
        id: 5,
        title: "five",
        branch: "adelaide",
        date: "14/5/24",
        article_start: "This is the first few sentences of the article",
        image: "news_image.png"
    },
    {
        id: 6,
        title: "six",
        branch: "adelaide",
        date: "14/5/24",
        article_start: "This is the first few sentences of the article",
        image: "news_image.png"
    },
    {
        id: 7,
        title: "seven",
        branch: "adelaide",
        date: "14/5/24",
        article_start: "This is the first few sentences of the article",
        image: "news_image.png"
    },
    {
        id: 8,
        title: "eight",
        branch: "adelaide",
        date: "14/5/24",
        article_start: "This is the first few sentences of the article",
        image: "news_image.png"
    }
];

createApp({
data() {
    return {
        access_level: 1,    // 0 for visitor, 1 for user, 2 for manager, 3 for admin
        message: 'Hello Vue!',
        navitems: navitems,
        events_results: testEvents,
        show_events_filters: false,
        branches_summary: testBranchSummary,
        event_selected: testEventDetails, // set to null intially in real thing
        event_attendance: 4,
        news_array: testNews
    };
},
methods: {
    events_search() {
        // Get the value of all the relevant filter options and search term
        let search_term = document.getElementById("events-search").value;
        let from_date = document.getElementById("from-date").value;
        let to_date = document.getElementById("to-date").value;
        let num_events = document.getElementById("num-events").value;
        let branches_selected = [];
        let branches_boxes = document.getElementsByName("branch_filters");
        for(let i = 0; i < branches_boxes.length; i++){
            if(branches_boxes[i].checked){
                branches_selected.push(branches_boxes[i].value);
            }
        }

        console.log("search term: " + search_term);
        console.log("from date: " + from_date);
        console.log("to date: " + to_date);
        console.log("num events: " + num_events);
        console.log("branches selected: " + branches_selected);

        // Construct the query parameters
        let query_parameters = "";
        if(search_term !== ""){
            query_parameters += "?search=" + search_term + '&';
        }
        if(from_date !== ""){
            query_parameters += "?from=" + from_date + '&';
        }
        if(to_date !== ""){
            query_parameters += "?to=" + to_date + '&';
        }
        if(num_events !== ""){
            query_parameters += "?n=" + num_events + '&';
        }
        for(let i = 0; i < branches_selected.length; i++){
            query_parameters += "?branch=" + branches_selected[i] + '&';
        }
        // remove the last &
        if(query_parameters !== ""){
            query_parameters = query_parameters.substring(0, query_parameters.length - 1);
        }
        console.log("query parameters: " + query_parameters);

        // Construct the URL based on whether user is logged in or not (to determine whether they can see private events or not)
        let query_path = "";
        if(this.logged_in){
            // requires authentication on server
            query_path = "/users/events/search" + query_parameters;
        } else {
            // Only allow public events
            query_path = "/events/search" + query_parameters;
        }

        console.log("request url: " + query_path);
    },
    events_show_more_results(){
        // Increase the max number of events shown by 5
        document.getElementById("num-events").value = parseInt(document.getElementById("num-events").value) + 5;

        // Call the events_search function to get the events from the server
        this.events_search();
    }
}
}).mount('#app');