CREATE TABLE [dbo].[ingredients](
    [recipe_id]  INT NOT NULL,
	[ingredient] [varchar](30)  ,
    [amount]  real ,
    [unit] [varchar](30) ,
    PRIMARY KEY (recipe_id,ingredient),
)
