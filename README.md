# cinewatch

Our web application provides an easy way to keep track of movies that the user
wants to watch in the near future. It will support approximately 100 users a year
(we arrived at this estimate based on the fact that a freely available api key for an
existing movie database has a limit of 1000 requests per day) and include a
simple log-in system with a username and password so that users can keep track
of their own “to-watch” list. Users can search both released and upcoming
movies from a database to determine what they would like to watch, add movies
to their personal list, sort their list by release date, genre, actor or awards won,
update the order that a movie appears in the list, and then when they have seen
it, can mark it as watched. Having a data-driven backend allows for such a web
app to exist because otherwise, there would be no way to create a log-in system
or allow users to keep track of their own list of movies and have that list persist
through multiple sessions.
