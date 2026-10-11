#ifndef BANK_QUEUE_H
#define BANK_QUEUE_H

#include <stddef.h>

#define QUEUE_NAME_CAPACITY 80

typedef struct QueueNode {
    int token_number;
    char customer_name[QUEUE_NAME_CAPACITY];
    char status[8];
    struct QueueNode *next;
} QueueNode;

typedef struct {
    QueueNode *front;
    QueueNode *rear;
    size_t length;
    unsigned tokens_generated;
    unsigned customers_served;
    int next_token_number;
    char last_served_name[QUEUE_NAME_CAPACITY];
} BankQueue;

void queue_initialize(BankQueue *queue);
int queue_generate(BankQueue *queue, const char *customer_name, int *token_number);
int queue_serve(BankQueue *queue, char *customer_name, size_t name_capacity, int *token_number);
void queue_display(const BankQueue *queue);
void queue_display_summary(const BankQueue *queue);
void queue_reset(BankQueue *queue);

#endif