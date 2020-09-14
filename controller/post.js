exports.getPosts = (req, res) => {
   res.json({
      posts: [
         { title: "Hello node js", body: "Body from node js" },
         { title: "Good Morning", body: "Body from Good morning" },
      ],
   });
};
