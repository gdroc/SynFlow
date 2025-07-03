#!/usr/bin/python3.9
import os
import argparse
import json
import time
import uuid
import tempfile 
from bioblend.galaxy import GalaxyInstance

# Argument Parsing
parser = argparse.ArgumentParser()

# Galaxy instance arguments
parser.add_argument("--url", type=str, required=True, help="URL of the Galaxy instance")
parser.add_argument("--workflow", type=str, required=True, help="Name of the workflow")
parser.add_argument("--query", type=str, required=True, help="Path to the query file")
parser.add_argument("--target", type=str, required=True, help="Path to the target file")
parser.add_argument("--outdir", type=str, required=True, help="Path to the output directory")
parser.add_argument("--delete-history", action="store_true", help="Delete the history after completion")
parser.add_argument("--debug", action="store_true", help="Enable debug mode")

args = parser.parse_args()

# Galaxy API Key (from environment variable)
api_key = os.environ['GALAXY_API_KEY']


# Generate a random, unique name for the history
def generate_unique_name(base_name="Analysis"):
    unique_suffix = str(uuid.uuid4())[:8]  # Generate a short unique ID (first 8 characters of UUID)
    return f"{base_name}_{unique_suffix}"



# Debug print function
def debug_print(message):
    if args.debug:
        print(message)

# Connect to Galaxy Instance
debug_print("Connecting to Galaxy instance...")
if not api_key:
    raise EnvironmentError("Please set the GALAXY_API_KEY environment variable.")


# url : https://usegalaxy.fr/

# Connect to Galaxy Instance
gi = GalaxyInstance(url=args.url, key=api_key)
workflow_name = args.workflow
history_name = generate_unique_name(workflow_name if workflow_name else "Analysis")
debug_print(f"Generated unique history name: {history_name}")


# Create a new history with the unique name
history = gi.histories.create_history(history_name)
history_id = history['id']

debug_print(f"Created history with ID: {history_id}")
workflows = gi.workflows.get_workflows()


# Find the Workflow
for workflow in workflows:
    if workflow['name'] == workflow_name:
        workflow_id = workflow['id']
        break
if not workflow_id:
    raise ValueError("Workflow 'Synflow' not found.")

debug_print(f"Using workflow with ID: {workflow_id}")
wf = gi.workflows.show_workflow(workflow_id)  

# Upload files to the history
query = gi.tools.upload_file(str(args.query), history_id)
target = gi.tools.upload_file(str(args.target), history_id)

query_id = query['outputs'][0]['id']
target_id = target['outputs'][0]['id']
debug_print(f"Uploaded files: Query ID {query_id}, Target ID {target_id}")

# Map datasets to workflow inputs
dataset_map = {
    '0': {'id': query_id, 'src': 'hda'},
    '1': {'id': target_id, 'src': 'hda'}
}

# Invoke the workflow
invocation = gi.workflows.invoke_workflow(workflow_id, dataset_map, history_id=history_id)
invocation_id = invocation['id']
debug_print(f"Workflow invoked with ID: {invocation['id']}")



# After invoking the workflow, let's fetch the invocation and inspect the outputs

gi.invocations.wait_for_invocation(invocation_id)

# Create a temporary directory to store the output files

#temp_dir="results"
temp_dir = str(args.outdir)

debug_print(f"Using temporary directory: {temp_dir}")

# Once the workflow is finished, retrieve all datasets from the history
debug_print("Retrieving datasets...")
# Fetch and download results
datasets = gi.histories.show_matching_datasets(history_id, name_filter='.*')
for dataset in datasets:
    if dataset['name'] in ['syri.out']:

        output_path = os.path.join(temp_dir, dataset['name'])
        gi.datasets.download_dataset(dataset['id'], file_path=output_path, use_default_filename=False)
        debug_print(f"Downloading {dataset['name']} to {output_path}")

debug_print("Results downloaded successfully.")

# Optionally, delete the history after processing
if args.delete_history:
    debug_print(f"Deleting history with ID: {history_id}")
    gi.histories.delete_history(history_id, purge=True)
    debug_print("History deleted.")
else:
    debug_print(f"History with ID {history_id} will not be deleted.")