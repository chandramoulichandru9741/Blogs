const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const router = express.Router();

const apiUrl = 'https://intent-kit-16.hasura.app/api/rest/blogs';
const adminSecret = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

// Function to fetch blog data from the API
async function fetchBlogData() {
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'x-hasura-admin-secret': adminSecret,
      },
    });

    return response.data.blogs; 
  } catch (error) {
    throw new Error('Error fetching data from the API: ' + error.message);
  }
}

// Memoize the function with a caching period of 5 minutes 
const memoizedFetchBlogData = _.memoize(fetchBlogData, undefined, 300000);

// The blog stats route
router.get('/blog-stats', async (req, res) => {
  try {
    const blogs = await memoizedFetchBlogData();

    if (!Array.isArray(blogs)) {
      console.error('API response is empty');
      return res.status(500).json({ error: 'Error fetching and analyzing blog data' });
    }

    // Data analysis
    const totalBlogs = blogs.length;
    const longestTitle = _.maxBy(blogs, (blog) => blog.title.length).title;
    const privacyBlogs = _.filter(blogs, (blog) => _.includes(_.toLower(blog.title), 'privacy'));
    const uniqueTitles = _.uniqBy(blogs, 'title').map((blog) => blog.title);

    const stats = {
      totalBlogs,
      longestTitle,
      privacyBlogs: privacyBlogs.length,
      uniqueTitles,
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching and analyzing blog data:', error.message);
    res.status(500).json({ error: 'Error fetching and analyzing blog data: ' + error.message });
  }
});

// The blog search route
router.get('/blog-search', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const blogs = await memoizedFetchBlogData();

    if (!Array.isArray(blogs)) {
      console.error('API response is empty');
      return res.status(500).json({ error: 'Error fetching and searching blog data' });
    }

    // Search method
    const matchingBlogs = blogs.filter((blog) => {
      const title = blog.title;
      return title.includes(query);
    });

    res.json(matchingBlogs);
  } catch (error) {
    console.error('Error fetching and searching blog data:', error.message);
    res.status(500).json({ error: 'Error fetching and searching blog data: ' + error.message });
  }
});

module.exports = router;
