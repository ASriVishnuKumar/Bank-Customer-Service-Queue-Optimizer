#include "queue.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void queue_initialize(BankQueue *queue) {
    queue->front = NULL;
    queue->rear = NULL;
    queue->length = 0;
    queue->tokens_generated = 0;
    queue->customers_served = 0;
    queue->next_token_number = 101;
    queue->last_served_name[0] = '\0';
}

int queue_generate(BankQueue *queue, const char *customer_name, int *token_number) {
    QueueNode *node;

    if (queue == NULL || customer_name == NULL || customer_name[0] == '\0') {
        return 0;
    }

    node = malloc(sizeof(*node));
    if (node == NULL) {
        return 0;
    }

    node->token_number = queue->next_token_number;
    snprintf(node->customer_name, sizeof(node->customer_name), "%s", customer_name);
    snprintf(node->status, sizeof(node->status), "Waiting");
    node->next = NULL;

    if (queue->rear == NULL) {
        queue->front = node;
        queue->rear = node;
    } else {
        queue->rear->next = node;
        queue->rear = node;
    }

    queue->length += 1;
    queue->tokens_generated += 1;
    queue->next_token_number += 1;
    if (token_number != NULL) {
        *token_number = node->token_number;
    }
    return 1;
}

int queue_serve(BankQueue *queue, char *customer_name, size_t name_capacity, int *token_number) {
    QueueNode *served_node;

    if (queue == NULL || queue->front == NULL) {
        return 0;
    }

    served_node = queue->front;
    queue->front = served_node->next;
    queue->length -= 1;
    if (queue->front == NULL) {
        queue->rear = NULL;
    }

    snprintf(served_node->status, sizeof(served_node->status), "Served");
    snprintf(queue->last_served_name, sizeof(queue->last_served_name), "%s", served_node->customer_name);
    if (customer_name != NULL && name_capacity > 0) {
        snprintf(customer_name, name_capacity, "%s", served_node->customer_name);
    }
    if (token_number != NULL) {
        *token_number = served_node->token_number;
    }

    queue->customers_served += 1;
    free(served_node);
    return 1;
}

void queue_display(const BankQueue *queue) {
    const QueueNode *current;

    if (queue == NULL || queue->front == NULL) {
        puts("No customers waiting.");
        return;
    }

    printf("FRONT -> ");
    current = queue->front;
    while (current != NULL) {
        printf("[%d | %s | %s]", current->token_number, current->customer_name, current->status);
        current = current->next;
        if (current != NULL) {
            printf(" -> ");
        }
    }
    puts(" <- REAR");
}

void queue_display_summary(const BankQueue *queue) {
    if (queue == NULL) {
        return;
    }

    printf("\nTokens generated : %u\n", queue->tokens_generated);
    printf("Customers served: %u\n", queue->customers_served);
    printf("Waiting in queue: %zu\n", queue->length);
    printf("Last served     : %s\n", queue->last_served_name[0] ? queue->last_served_name : "None");
    printf("Queue status    : %s\n\n", queue->length > 0 ? "In progress" : "Open");
}

void queue_reset(BankQueue *queue) {
    QueueNode *current;

    if (queue == NULL) {
        return;
    }

    current = queue->front;
    while (current != NULL) {
        QueueNode *next = current->next;
        free(current);
        current = next;
    }

    queue_initialize(queue);
}