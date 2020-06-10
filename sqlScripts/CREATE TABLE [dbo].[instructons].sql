CREATE TABLE [dbo].[instructions](
    [recipe_id] INT ,
	[num] [varchar](30)  ,
    [content] [varchar](8000) ,
    PRIMARY KEY (recipe_id,num),
)
