CREATE TABLE [dbo].[users_recipes](
    [id] INT NOT NULL,
	[username] [varchar](30)  FOREIGN KEY REFERENCES users(username),
	[recipe_id] [varchar](30) NOT NULL ,
    [watched_in] [int] ,
    [favorite_in] [int] ,
    PRIMARY KEY (username,recipe_id),

)

