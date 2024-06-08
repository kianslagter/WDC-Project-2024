const { createApp, ref } = Vue;

const navitems = [
    { title: 'Home', url: '/' },
    { title: 'Events', url: '/events' },
    { title: 'News', url: '/news' },
    { title: 'Branches', url: '/branches' },
    { title: 'Login', url: '/login' }

];

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


const people = [
    {
        id: 1,
        name: 'John Doe',
        address: '129 Waymouth Street, Adelaide SA 5000',
        phone: '0412345678',
        email: 'johndoe@mealmates.com'
    },
    {
        id: 2,
        name: 'Mike Smith',
        address: '129 Waymouth Street, Adelaide SA 5000',
        phone: '0412345678',
        email: 'mikesmith@mealmates.com'
    },
    {
        id: 3,
        name: 'Earl Grey',
        address: '129 Waymouth Street, Adelaide SA 5000',
        phone: '0412345678',
        email: 'earl@mealmates.com'
    },
    {
        id: 4,
        name: 'Adam James',
        address: '129 Waymouth Street, Adelaide SA 5000',
        phone: '0412345678',
        email: 'adamjames@mealmates.com'
    },
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
            news_results: [],
            show_preview: true,
            create_news_preview: "",
            news_array: [],
            news_array1: [],
            article_selected: null,
            num_points: 1,
            point_level: [0],
            branch_selected: null,
            people: people,
            loading: true,
            event: null,
            isLoading: false,
            error: null
        };
    },
    setup() {
        const event_selected = ref(null);
        const article_selected = ref(null);
        const branch_selected = ref(null);
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
        // call getNewsDetails if the page is on an news details page
        let articleID = window.location.pathname.split('/')[3];

        if (articleID && window.location.pathname.split('/')[1] == 'news') {
            getNewsDetails(articleID, function (data) {
                article_selected.value = data;
                loading.value = false;
            });

            return {
                article_selected,
                loading,
            };
        }
        // call getBranchDetails if the page is on an branch details page
        let branchID = window.location.pathname.split('/')[3];

        if (branchID && window.location.pathname.split('/')[1] == 'branches') {
            getBranchDetails(branchID, function (data) {
                branch_selected.value = data;
                loading.value = false;
            });

            return {
                branch_selected,
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
            // loading check
            this.isLoading = true;
            this.error = null;

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
            if (num_news !== "") {
                query_parameters += "n=" + encodeURIComponent(num_news) + '&';
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
                query_path = "/users/news/search" + query_parameters;
            } else {
                // Only allow public events
                query_path = "/news/search" + query_parameters;
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
                    console.log("Fetched news:", data);
                    this.news_results = data;
                })
                .catch(error => {
                    console.error("Error fetching news:", error);
                    this.news_results = [];
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        news_load() {
            // loading check
            this.isLoading = true;
            this.error = null;
            let query_parameters = '';

            // Construct the URL based on whether user is logged in or not (to determine whether they can see private events or not)
            let query_path = "";
            if (this.access_level > 0) {
                // requires authentication on server
                query_path = "/users/news/get" + query_parameters;
            } else {
                // Only allow public events
                query_path = "/news/get" + query_parameters;
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
                    console.log("Fetched news:", data);
                    this.news_results = data;
                })
                .catch(error => {
                    console.error("Error fetching news:", error);
                    this.news_results = [];
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        news_show_more_results() {
            // Increase the max number of news shown by 5
            document.getElementById("num-news").value = parseInt(document.getElementById("num-news").value) + 5;

            // Call the news_search function to get the news from the server
            this.news_search();
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
        editNews(newsId) {
            window.location.href = `/manage/news/edit/${newsId}`;
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
        // load news on news page
        if (window.location.pathname.split('/')[1] == 'news' && !window.location.pathname.split('/')[2]) {
            this.news_load();
        }
        // load news on main page
        if (!window.location.pathname.split('/')[1]) {
            this.news_load();
        }
    }
}).mount('#app');