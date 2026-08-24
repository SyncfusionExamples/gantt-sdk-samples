import { createRoot } from 'react-dom/client';
import { useEffect, useRef, useState } from 'react';
import {
    GanttComponent,
    Inject,
    Selection,
    ColumnDirective,
    ColumnsDirective,
    VirtualScroll,
    Edit
} from '@syncfusion/ej2-react-gantt';

/**
 * Demo: Syncfusion React Gantt with row + timeline virtualization.
 * Renders 50K / 75K / 100K hierarchical tasks and reports render time
 * via the `dataBound` callback.
 *
 * @returns {JSX.Element} The status bar + Gantt component.
 */
const Virtualscroll = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState('');
    const [enableValidation, setEnableValidation] = useState(false);
    const [statusText, setStatusText] = useState('0.000 sec');
    const [renderKey, setRenderKey] = useState(0);

    const startTime = useRef(0);
    const ganttRef = useRef(null);

    const taskFields = {
        id: 'TaskID',
        name: 'TaskName',
        startDate: 'StartDate',
        endDate: 'EndDate',
        progress: 'Progress',
        parentID: 'parentID',
        dependency: 'Predecessor'
    };

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
    const generateVirtualData = (recordCount) => {

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

    /**
     * Generates a virtual dataset of `count` records, pushes it to
     * state, and remounts the Gantt so VirtualScroll rebuilds cleanly.
     * Heavy work is deferred one tick so React can paint the loading
     * state first.
     *
     * @param {number} count Number of records to generate (50_000 / 75_000 / 100_000).
     * @returns {void}
     */
    const loadData = (count) => {
        if (!count || loading) {
            return;
        }

        setLoading(true);
        setSelectedDataset(String(count));
        setStatusText('⏳ Loading...');
        startTime.current = performance.now();

        window.setTimeout(() => {
            const generated = generateVirtualData(count);
            setData(generated);
            setRenderKey((k) => k + 1);
        }, 0);
    };

    /**
     * Safety net for `dataBound`: if it never fires (it can be skipped
     * when the dataSource transitions empty -> populated under
     * virtualization), force-clear the loading state after 5 seconds.
     */
    useEffect(() => {
        if (!loading) {
            return;
        }
        const t = window.setTimeout(() => {
            setLoading(false);
            setStatusText((prev) =>
                prev.startsWith('⏳') ? '0.000 sec' : prev
            );
        }, 5000);
        return () => window.clearTimeout(t);
    }, [loading, data]);

    /**
     * `dataBound` handler — computes elapsed time since `loadData`
     * started and writes it to the status bar.
     *
     * @returns {void}
     */
    const onDataBound = () => {

        if (!startTime.current) {
            return;
        }

        const totalTime =
            ((performance.now() - startTime.current) / 1000).toFixed(3);

        setStatusText(`✅ Loaded ${totalTime} sec`);
        setLoading(false);
        startTime.current = 0;
    };

    return (
        <div className='control-pane'>
            <div className="status-bar">
                <span className="dataset-control">
                    <label htmlFor="dataset-select">Dataset:</label>
                    <select
                        id="dataset-select"
                        className="record-dropdown"
                        value={selectedDataset}
                        disabled={loading}
                        onChange={(e) => loadData(Number(e.target.value))}
                    >
                        <option value="" disabled>
                            {selectedDataset ? 'Change…' : 'Select'}
                        </option>
                        <option value="50000">50K</option>
                        <option value="75000">75K</option>
                        <option value="100000">100K</option>
                    </select>
                    {selectedDataset && !loading && data.length > 0 && (
                        <span className="current-selection" aria-live="polite">
                            Loaded:&nbsp;
                            <strong>
                                {(
                                    data.length
                                ).toLocaleString('en-IN')}
                            </strong>
                            &nbsp;records
                        </span>
                    )}
                </span>
                <span>
                    <label className="validation-toggle">
                        <input
                            type="checkbox"
                            checked={enableValidation}
                            onChange={(e) => setEnableValidation(e.target.checked)}
                        />
                        {' '}Auto Validation
                    </label>
                </span>
                <span className="status-text">
                    {statusText}
                </span>
            </div>

            <GanttComponent
                ref={ganttRef}
                key={`gantt-${renderKey}-${enableValidation ? 'val-on' : 'val-off'}`}
                id='VirtualScroll'
                dataSource={data}
                treeColumnIndex={1}
                enableVirtualization={true}
                enableTimelineVirtualization={true}
                taskFields={taskFields}
                height='650px'
                dataBound={onDataBound}
                autoCalculateDateScheduling={enableValidation}
                loadingIndicator={{ indicatorType: 'Shimmer' }}
                spinnerSettings={{ showSpinner: true }}
            >
                <ColumnsDirective>
                    <ColumnDirective field='TaskID' width='100' />
                    <ColumnDirective field='TaskName' width='300' />
                    <ColumnDirective field='StartDate' />
                    <ColumnDirective field='Progress' />
                </ColumnsDirective>

                <Inject services={[Selection, VirtualScroll, Edit]} />
            </GanttComponent>
        </div>
    );
};

export default Virtualscroll;

const root = createRoot(document.getElementById('sample'));
root.render(<Virtualscroll />);