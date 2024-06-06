const { createApp, ref } = Vue;

const navitems = [
    { title: 'Home', url: '/' },
    { title: 'Events', url: '/events' },
    { title: 'News', url: '/news' },
    { title: 'Branches', url: '/branches' },
    { title: 'Login', url: '/login' }
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
    image_url: 'https://media.istockphoto.com/id/1362787762/photo/details-of-volunteer-with-box-of-food-for-poor.jpg?s=612x612&w=0&k=20&c=q-eLXPRlCfDV2m8mRJt1GIoExrSQJFW1h8FiE6LoMc0='
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

const testUpdateDetails = {
    id: 3,
    title: 'Welcome Adelaide!',
    description: "Meal Mates opens its Adelaide branch at 129 Waymouth Street, inviting all to join in addressing hunger and building community from 9 am to 5 pm. With nutritious meals and empowerment initiatives, they strive for a hunger-free future in Adelaide.",
    details: [
        "Adelaide, a new dawn has arrived! We are thrilled to inaugurate Meal Mates' Adelaide branch, located at 129 Waymouth Street, and extend a heartfelt welcome to all. Opening our doors from 9 am to 5 pm, we embark on a journey of compassion, solidarity, and nourishment. With a deep-rooted commitment to serving nutritious meals and fostering community connections, we stand ready to make a meaningful impact.",
        "From cooking classes to nutrition workshops, our aim is not just to feed, but to empower. Adelaide, let's write a new chapter together—one where hunger becomes a thing of the past and every individual thrives.",
        "For more details contact adelaide@mealmates.org"
    ],
    date_posted: '3/8/24',
    time_posted: '12.00pm',
    posted_by_branch: 'Adelaide',
    image_url: '/not_an_image.jpg',
};

const testNews = [
    {
        id: 10,
        title: "Thanks Melbourne!",
        description: "Meal Mates extends sincere thanks to our Melbourne branch volunteers. Your dedication helps nourish our community and create a sense of belonging for all.",
        date_posted: '1/7/24',
        time_posted: '1.20pm',
        posted_by_branch: 'Melbourne',
        image_url: '/not_an_image.jpg'
    },
    {
        id: 20,
        title: "Branch Opening In Sydney",
        description: "Discover Meal Mates' newest venture at its Sydney branch, located at 212 York Street, where we're dedicated to combating hunger and cultivating community from 8 am to 7 pm. With hearty meals and enriching initiatives, we're committed to building a brighter future for Sydney.",
        date_posted: '3/7/24',
        time_posted: '12.50pm',
        posted_by_branch: 'Sydney',
        image_url: '/not_an_image.jpg'
    },
    {
        id: 30,
        title: "Welcome Adelaide!",
        description: "Meal Mates opens its Adelaide branch at 129 Waymouth Street, inviting all to join in addressing hunger and building community from 9 am to 5 pm. With nutritious meals and empowerment initiatives, they strive for a hunger-free future in Adelaide.",
        date_posted: '3/8/24',
        time_posted: '12.00pm',
        posted_by_branch: 'Adelaide',
        image_url: '/not_an_image.jpg'
    }
];

const testNews1 = [
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
            events_results: [],
            show_events_filters: false,
            branches_summary: testBranchSummary,
            event_selected: null, // set to null intially in real thing
            event_attendance: 4,
            news_results: testNews,
            show_preview: true,
            create_news_preview: "",
            news_array: testNews,
            news_array1: testNews1,
            num_points: 1,
            point_level: [0],
            branch_selected: testBranchSummary[0],
            update_selected: testUpdateDetails,
            loading: true,
            event: null,
            isLoading: false,
            error: null
        };
    },
    setup() {
        const event_selected = ref(null);
        const loading = ref(true);
        // call getEventDetails if the page is on an events details page
        let eventID = window.location.pathname.split('/')[3];
        if (eventID && window.location.pathname.split('/')[1] == 'events') {
            getEventDetails(eventID, function (data) {
                event_selected.value = data;
                loading.value = false;
            });

            return {
                event_selected,
                loading,
            };
        }
    },
    methods: {
        events_search() {
            // loading check
            this.isLoading = true;
            this.error = null;

            // Get the value of all the relevant filter options and search term
            let search_term = document.getElementById("events-search").value;
            let from_date = document.getElementById("from-date").value;
            let to_date = document.getElementById("to-date").value;
            let num_events = document.getElementById("num-events").value;
            let branches_selected = [];
            let branches_boxes = document.getElementsByName("branch_filters");
            for (let i = 0; i < branches_boxes.length; i++) {
                if (branches_boxes[i].checked) {
                    branches_selected.push(branches_boxes[i].value);
                }
            }

            console.log("search term: " + search_term);
            console.log("from date: " + from_date);
            console.log("to date: " + to_date);
            console.log("num events: " + num_events);
            console.log("branches selected: " + branches_selected);

            // Construct the query parameters
            let query_parameters = "?";
            if (search_term !== "") {
                query_parameters += "search=" + encodeURIComponent(search_term) + '&';
            }
            if (from_date !== "") {
                query_parameters += "from=" + encodeURIComponent(from_date) + '&';
            }
            if (to_date !== "") {
                query_parameters += "to=" + encodeURIComponent(to_date) + '&';
            }
            if (num_events !== "") {
                query_parameters += "n=" + encodeURIComponent(num_events) + '&';
            }
            for (let i = 0; i < branches_selected.length; i++) {
                query_parameters += "branch=" + encodeURIComponent(branches_selected[i]) + '&';
            }
            // remove the last &
            if (query_parameters !== "") {
                query_parameters = query_parameters.substring(0, query_parameters.length - 1);
            }
            console.log("query parameters: " + query_parameters);

            // Construct the URL based on whether user is logged in or not (to determine whether they can see private events or not)
            let query_path = "";
            if (this.access_level > 0) {
                // requires authentication on server
                query_path = "/users/events/search" + query_parameters;
            } else {
                // Only allow public events
                query_path = "/events/search" + query_parameters;
            }
            // AJAX
            fetch(query_path, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`error status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched events:", data);
                    this.events_results = data;
                })
                .catch(error => {
                    console.error("Error fetching events:", error);
                    this.events_results = [];
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        events_load() {
            // loading check
            this.isLoading = true;
            this.error = null;
            let query_parameters = '';

            // for which branch
            if (window.location.pathname.split('/')[1] == 'branches' && window.location.pathname.split('/')[3] >= 0) {
                query_parameters += "?";
                let branchID = window.location.pathname.split('/')[3];
                query_parameters += "branch=" + encodeURIComponent(branchID);
            }

            // Construct the URL based on whether user is logged in or not (to determine whether they can see private events or not)
            let query_path = "";
            if (this.access_level > 0) {
                // requires authentication on server
                query_path = "/users/events/get" + query_parameters;
            } else {
                // Only allow public events
                query_path = "/events/get" + query_parameters;
            }

            // AJAX
            fetch(query_path, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`error status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched events:", data);
                    this.events_results = data;
                })
                .catch(error => {
                    console.error("Error fetching events:", error);
                    this.events_results = [];
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        news_search() {
            // Get the value of all the relevant filter options and search term
            let search_term = document.getElementById("news-search").value;
            let from_date = document.getElementById("from-date").value;
            let to_date = document.getElementById("to-date").value;
            let num_news = document.getElementById("num-news").value;
            let branches_selected = [];
            let branches_boxes = document.getElementsByName("branch_filters");
            for (let i = 0; i < branches_boxes.length; i++) {
                if (branches_boxes[i].checked) {
                    branches_selected.push(branches_boxes[i].value);
                }
            }

            console.log("search term: " + search_term);
            console.log("from date: " + from_date);
            console.log("to date: " + to_date);
            console.log("num news: " + num_news);
            console.log("branches selected: " + branches_selected);

            // Construct the query parameters
            let query_parameters = "";
            if (search_term !== "") {
                query_parameters += "?search=" + search_term + '&';
            }
            if (from_date !== "") {
                query_parameters += "?from=" + from_date + '&';
            }
            if (to_date !== "") {
                query_parameters += "?to=" + to_date + '&';
            }
            if (num_news !== "") {
                query_parameters += "?n=" + num_news + '&';
            }
            for (let i = 0; i < branches_selected.length; i++) {
                query_parameters += "?branch=" + branches_selected[i] + '&';
            }
            // remove the last &
            if (query_parameters !== "") {
                query_parameters = query_parameters.substring(0, query_parameters.length - 1);
            }
            console.log("query parameters: " + query_parameters);

            // Construct the URL based on whether user is logged in or not (to determine whether they can see private events or not)
            let query_path = "";
            if (this.logged_in) {
                // requires authentication on server
                query_path = "/users/news/search" + query_parameters;
            } else {
                // Only allow public events
                query_path = "/news/search" + query_parameters;
            }

            console.log("request url: " + query_path);
        },
        news_show_more_results() {
            // Increase the max number of events shown by 5
            document.getElementById("num-events").value = parseInt(document.getElementById("num-news").value) + 5;

            // Call the events_search function to get the events from the server
            this.events_search();
        },
        events_show_more_results() {
            // Increase the max number of events shown by 5
            document.getElementById("num-events").value = parseInt(document.getElementById("num-events").value) + 5;

            // Call the events_search function to get the events from the server
            this.events_search();
        },
        RSVP(response, eventID) {
            if (typeof this.access_level === 'undefined' || this.access_level == 0) {
                // Visitor, redirect to login page
                window.location.href = '/login';
            } else {
                if (!eventID) {
                    console.error("No event ID found");
                    return;
                }

                const data = {
                    eventID: eventID.toString(),
                    RSVP: response
                };
                console.log("Sending data:", data);

                fetch('/users/events/rsvp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => {
                        if (response.ok) {
                            console.log("RSVP successful");
                            alert('RSVP Successful!');
                        } else if (response.status == 400) {
                            console.error("Invalid request data");
                            alert('RSVP Unsuccessful');
                        } else if (response.status == 500) {
                            console.error("Server error");
                        } else {
                            console.error("Unexpected error");
                        }
                    })
                    .catch(error => {
                        console.error("Error:", error);
                    });
            }
        },
        getEventIDFromPath() {
            try { // try get event id from pathname for event details
                const path = window.location.pathname;
                const segments = path.split('/');
                return segments[segments.length - 1];
            } catch (error) {
                console.error("Error extracting event ID from pathname:", error);
            }
            return null;
        },
        selectBranch(branchId) {
            this.branch_selected = testBranchSummary.find(branch => branch.id === branchId);
            window.location.href = `/branches/id/${branchId}`;
        },
        editEvent(eventId) {
            window.location.href = `/manage/events/edit/${eventId}`;
        },
        eventRSVPresponse(eventId) {
            window.location.href = `/manage/events/responses/${eventId}`;
        },
    },
    mounted() {
        // load events on page initally, probably a better way to do this
        if (window.location.pathname.split('/')[1] == 'events' && !window.location.pathname.split('/')[2]) {
            this.events_load();
        }
        // on branch details page show events also but only for that branch
        if (window.location.pathname.split('/')[1] == 'branches' && window.location.pathname.split('/')[2] == 'id') {
            this.events_load();
        }
    }
}).mount('#app');
