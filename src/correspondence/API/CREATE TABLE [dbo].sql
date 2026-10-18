CREATE TABLE [dbo].[CORRESPONDENCETABLE] (
    [Id]                 INT            IDENTITY (1, 1) NOT NULL,
    [FiscalYear]         NVARCHAR (50)  NOT NULL,
    [ReferenceId]        NVARCHAR (100) NOT NULL,
    [ParticularTitle]    NVARCHAR (200) NOT NULL,
    [ParticularSubtitle] NVARCHAR (500) NULL,
    [FromName]           NVARCHAR (200) NOT NULL,
    [FromOrg]            NVARCHAR (300) NULL,
    [ReceivedBy]         NVARCHAR (100) NULL,
    [ReceivedDate]       NVARCHAR (50)  NULL,
    [ForwardedToName]    NVARCHAR (200) NOT NULL,
    [ForwardedToDept]    NVARCHAR (200) NOT NULL,
    [HandoverStatus]     NVARCHAR (50)  DEFAULT ('PENDING') NULL,
    [HandoverDate]       NVARCHAR (50)  NULL,
    [HandoverBy]         NVARCHAR (100) NULL,
    [Remarks]            NVARCHAR (MAX) NULL,
    [Type]               NVARCHAR (20)  DEFAULT ('incoming') NULL,
    [CreatedDate]        DATETIME       DEFAULT (getdate()) NULL,
    [CreatedBy]          NVARCHAR (100) NULL,
    [OrganizationId]      UNIQUEIDENTIFIER NULL,
    
    PRIMARY KEY CLUSTERED ([Id] ASC),
    UNIQUE NONCLUSTERED ([ReferenceId] ASC)
);

