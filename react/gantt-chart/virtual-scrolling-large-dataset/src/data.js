/**
* Builds a hierarchical task list on the fly.
* Each parent project gets 20 children arranged in 4 sets of 5;
* Set-1 task #1 is the FS-predecessor of Set-4 task #1.
*
* @param {number} recordCount Approximate number of records to generate.
*   The real count is snapped down to a whole number of parent blocks
*   (1 parent + 20 children = 21 records).
* @returns {Array<object>} Flat array of task records.
*/
export const generateVirtualData = (recordCount) => {

    const virtualData = [];

    const setsPerParent = 4;
    const tasksPerSet = 5;
    const childPerParent = setsPerParent * tasksPerSet; // 20
    const blockSize = childPerParent + 1;
    const totalParents = Math.floor(recordCount / blockSize);

    let taskId = 1;

    for (let parent = 1; parent <= totalParents; parent++) {

        const parentTaskId = taskId;

        // Parent task
        virtualData.push({
            TaskID: parentTaskId,
            TaskName: `Project ${parent}`,
            StartDate: new Date(2025, 0, 3),
            EndDate: new Date(2025, 1, 28),
            Progress: 50
        });

        taskId++;

        let set1FirstTaskId = null;

        for (let set = 1; set <= 4; set++) {

            // Same dates for all tasks in a set
            const startDate = new Date(2025, 0, 3 + ((set - 1) * 7));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 4);

            for (let child = 1; child <= tasksPerSet; child++) {

                const currentTaskId = taskId;
                let predecessor = '';

                // Store Set1 first task
                if (set === 1 && child === 1) {
                    set1FirstTaskId = currentTaskId;
                }

                // Set1 First Task -> Set4 First Task
                if (
                    set === 4 &&
                    child === 1 &&
                    set1FirstTaskId
                ) {
                    predecessor = `${set1FirstTaskId}FS`;
                }

                virtualData.push({
                    TaskID: currentTaskId,
                    TaskName: `Project ${parent} - Set ${set} Task ${child}`,
                    StartDate: new Date(startDate),
                    EndDate: new Date(endDate),
                    Progress: 30,
                    parentID: parentTaskId,
                    Predecessor: predecessor
                });

                taskId++;
            }
        }
    }
    console.log('Total Records:', virtualData.length);
    return virtualData;
};