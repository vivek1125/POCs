using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TransactionService.Common;
using TransactionService.Controllers;
using TransactionService.Models;
using TransactionService.Repo;

namespace TransactionService.Tests.Controllers
{
    public class TransactionControllerTest
    {
        [Theory]
        [InlineData(91220, 3445.45, "Credit", "UPI", "2025-07-08 10:00:23 PM")]
        [InlineData(91220, 3323.01, "Debit", "ATM", "2025-07-08 10:02:23 PM")]
        [InlineData(91220, 238712, "Credit", "NetBanking", "2025-07-08 10:20:22 PM")]
        [InlineData(22011, 23000, "Credit", "UPI", "2025-07-08 10:34:23 PM")]
        [InlineData(91220, 500, "Debit", "ATM", "2025-07-08 11:45:23 PM")]
        public async Task UpdateBalance_ReturnTransactionDetails_whenValidInput(
            int accountNUmber,decimal balance, string transactionType, string transactionMode, string dateTime)
        {
            //Arrange
            var mockRepo = new Mock<ITransRepo>();
            var mockConfig = new Mock<IConfiguration>();

            mockRepo.Setup(repo => repo.UpdateAmount(accountNUmber, balance,
                It.IsAny<TransactionType>(), It.IsAny<TransactionMode>()))
                .ReturnsAsync(new Transaction
                {
                    AccountNumber = accountNUmber,
                    TransactionAmount = balance,
                    TransactionType = Enum.Parse<TransactionType>(transactionType, true),
                    TransactionMode = Enum.Parse<TransactionMode>(transactionMode, true),
                    TransDateTime = DateTime.Parse(dateTime,null)
                });
            var controllerObj = new TransactionController(mockConfig.Object, mockRepo.Object);

            // Act 
            var result = await controllerObj.UpdateBalance(accountNUmber, balance, transactionType, transactionMode);

            // Assert 

            var transaction = Assert.IsType<Transaction>(result.Value);

            Assert.Equal(accountNUmber, transaction.AccountNumber);
            Assert.Equal(balance, transaction.TransactionAmount);
            Assert.Equal(Enum.Parse<TransactionType>(transactionType, true), transaction.TransactionType);
            Assert.Equal(Enum.Parse<TransactionMode>(transactionMode, true), transaction.TransactionMode);
            Assert.Equal(DateTime.Parse(dateTime,null),transaction.TransDateTime);
        }
    }
}
