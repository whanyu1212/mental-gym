def activity_selection(start_times, end_times):
    """
    Select max number of non-overlapping activities.

    Strategy: Sort by end times and pick the earliest finishing one.
    """
    activities = sorted(zip(start_times, end_times), key=lambda x: x[1])
    count = 0
    last_end = -1

    for start, end in activities:
        if start >= last_end:
            count += 1
            last_end = end
    return count
