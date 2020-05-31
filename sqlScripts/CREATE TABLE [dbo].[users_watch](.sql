CREATE TABLE [dbo].[users](
	[user_id] [UNIQUEIDENTIFIER] PRIMARY KEY NOT NULL default NEWID(),
	[recipe_id] [varchar](30) PRIMARY KEY NOT NULL 
)

