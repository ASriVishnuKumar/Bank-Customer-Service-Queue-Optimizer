#include "queue.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int read_line(const char *prompt, char *buffer, size_t capacity) {
    size_t length;

    printf("%s", prompt);
    if (fgets(buffer, (int)capacity, stdin) == NULL) {
        return 0;
    }

    length = strlen(buffer);
    if (length > 0 && buffer[length - 1] == '\n') {
        buffer[length - 1] = '\0';
    } else {
        int character;
        while ((character = getchar()) != '\n' && character != EOF) {
        }
    }

    length = strlen(buffer);
    if (length > 0 && buffer[length - 1] == '\r') {
        buffer[length - 1] = '\0';
    }
    return 1;
}

static int read_menu_choice(void) {
    char input[32];
    char *end;
    long choice;

    if (!read_line("Choose an option: ", input, sizeof(input))) {
        return 0;
    }

    choice = strtol(input, &end, 10);
    while (*end == ' ' || *end == '\t') {
        end += 1;
    }
    if (end == input || *end != '\0') {
        return -1;
    }
    return (int)choice;
}

int main(void) {
    BankQueue queue;
    char customer_name[QUEUE_NAME_CAPACITY];
    int running = 1;

    queue_initialize(&queue);
    queue_generate(&queue, "Arun", NULL);
    queue_generate(&queue, "Priya", NULL);
    queue_generate(&queue, "Karthik", NULL);

    puts("BANK TOKEN QUEUE MANAGEMENT SYSTEM");
    puts("Serving every customer in order - FIFO\n");

    while (running) {
        int choice;

        puts("1. Generate token");
        puts("2. Serve next customer");
        puts("3. Display waiting list");
        puts("4. Queue summary");
        puts("5. Reset queue");
        puts("0. Exit");
        choice = read_menu_choice();
        if (choice == 0) {
            running = 0;
        } else if (choice == 1) {
            int token_number;
            if (!read_line("Customer name: ", customer_name, sizeof(customer_name))) {
                running = 0;
            } else if (customer_name[0] == '\0') {
                puts("Enter a customer name before generating a token.\n");
            } else if (queue_generate(&queue, customer_name, &token_number)) {
                printf("Token %d generated for %s.\n\n", token_number, customer_name);
            } else {
                puts("Unable to generate token. Check available memory.\n");
            }
        } else if (choice == 2) {
            int token_number;
            if (queue_serve(&queue, customer_name, sizeof(customer_name), &token_number)) {
                printf("Now serving %s (token %d).\n\n", customer_name, token_number);
            } else {
                puts("No customers waiting.\n");
            }
        } else if (choice == 3) {
            queue_display(&queue);
            putchar('\n');
        } else if (choice == 4) {
            queue_display_summary(&queue);
        } else if (choice == 5) {
            queue_reset(&queue);
            puts("Queue reset. The next token will be 101.\n");
        } else {
            puts("Choose a listed option.\n");
        }
    }

    queue_reset(&queue);
    puts("Queue closed. Goodbye.");
    return 0;
}