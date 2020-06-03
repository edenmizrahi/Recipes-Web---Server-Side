CREATE TABLE [dbo].[ingredients](
    [recipe_id]  INT NOT NULL,
	[ingredient] [varchar](30)  ,
    [amount] [varchar](30) ,
    PRIMARY KEY (recipe_id,ingredient),
)
