﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SupportDesk.Infrastructure.Data;

#nullable disable

namespace SupportDesk.Infrastructure.Migrations
{
    [DbContext(typeof(SupportDeskDbContext))]
    [Migration("20241023132342_AddMultipleCategoriesToTickets")]
    partial class AddMultipleCategoriesToTickets
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.10");

            modelBuilder.Entity("SupportDesk.Core.Entities.Attachment", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("FileName")
                        .HasColumnType("TEXT");

                    b.Property<string>("FilePath")
                        .HasColumnType("TEXT");

                    b.Property<long>("FileSize")
                        .HasColumnType("INTEGER");

                    b.Property<Guid>("TicketId")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("TicketId");

                    b.ToTable("Attachment");
                });

            modelBuilder.Entity("SupportDesk.Core.Entities.Category", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Categories");
                });

            modelBuilder.Entity("SupportDesk.Core.Entities.Ticket", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("AISuggestedPriority")
                        .HasColumnType("TEXT");

                    b.Property<string>("AISuggestedSteps")
                        .HasColumnType("TEXT");

                    b.Property<string>("AISuggestedTitle")
                        .HasColumnType("TEXT");

                    b.Property<string>("Category")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("Description")
                        .HasColumnType("TEXT");

                    b.Property<string>("Email")
                        .HasColumnType("TEXT");

                    b.Property<string>("Priority")
                        .HasColumnType("TEXT");

                    b.Property<string>("StepsToReproduce")
                        .HasColumnType("TEXT");

                    b.Property<string>("Title")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Tickets");
                });

            modelBuilder.Entity("SupportDesk.Core.Entities.TicketCategory", b =>
                {
                    b.Property<Guid>("TicketId")
                        .HasColumnType("TEXT");

                    b.Property<int>("CategoryId")
                        .HasColumnType("INTEGER");

                    b.HasKey("TicketId", "CategoryId");

                    b.HasIndex("CategoryId");

                    b.ToTable("TicketCategory");
                });

            modelBuilder.Entity("SupportDesk.Core.Entities.Attachment", b =>
                {
                    b.HasOne("SupportDesk.Core.Entities.Ticket", "Ticket")
                        .WithMany("Attachments")
                        .HasForeignKey("TicketId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Ticket");
                });

            modelBuilder.Entity("SupportDesk.Core.Entities.TicketCategory", b =>
                {
                    b.HasOne("SupportDesk.Core.Entities.Category", "Category")
                        .WithMany("TicketCategories")
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("SupportDesk.Core.Entities.Ticket", "Ticket")
                        .WithMany("TicketCategories")
                        .HasForeignKey("TicketId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Category");

                    b.Navigation("Ticket");
                });

            modelBuilder.Entity("SupportDesk.Core.Entities.Category", b =>
                {
                    b.Navigation("TicketCategories");
                });

            modelBuilder.Entity("SupportDesk.Core.Entities.Ticket", b =>
                {
                    b.Navigation("Attachments");

                    b.Navigation("TicketCategories");
                });
#pragma warning restore 612, 618
        }
    }
}
