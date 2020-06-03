CREATE TABLE [dbo].[personalRecipes](
    [recipe_id] INT NOT NULL ,
	[username] [varchar](30)  FOREIGN KEY REFERENCES users(username),
	[image] [varchar](30)  ,
    [title] [varchar](3000) ,
    [duration] [int] ,
    [Vegetarians] [int],
    [Vegan] [int],
    [glutenFree][int],
    [type] [varchar](30) ,
    PRIMARY KEY (username,recipe_id),

)
