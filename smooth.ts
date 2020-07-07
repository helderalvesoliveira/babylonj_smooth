import { Mesh } from 'babylonjs/Meshes/mesh';
import { VertexData, VertexBuffer } from 'babylonjs';

export class Smooth {

  private mesh: Mesh;
  constructor(mesh: Mesh) {
    this.mesh = mesh;
  }


  addSmoothMesh() {
    this.mesh.isPickable = true;
    const pdata = this.mesh.getVerticesData(VertexBuffer.PositionKind);
    const ndata = this.mesh.getVerticesData(VertexBuffer.NormalKind);
    const idata = this.mesh.getIndices();

    const newPdata = []; // new positions array
    const newIdata = []; // new indices array

    let mapPtr = 0; // new index;
    const uniquePositions = {}; // unique vertex positions
    for (let i = 0; i < idata.length; i += 3) {
      // console.log(idata[i]);
      const facet = [idata[i], idata[i + 1], idata[i + 2]]; // facet vertex indices
      const pstring = []; // lists facet vertex positions (x,y,z) as string "xyz""
      for (let j = 0; j < 3; j++) { //
        pstring[j] = '';
        for (let k = 0; k < 3; k++) {
          // small values make 0
          if (Math.abs(pdata[3 * facet[j] + k]) < 0.0001) {
            pdata[3 * facet[j] + k] = 0;
          }
          pstring[j] += pdata[3 * facet[j] + k] + '|';
        }
        pstring[j] = pstring[j].slice(0, -1);
      }
      // check facet vertices to see that none are repeated
      // do not process any facet that has a repeated vertex, ie is a line
      if (!(pstring[0] === pstring[1] || pstring[0] === pstring[2] || pstring[1] === pstring[2])) {
        // for each facet position check if already listed in uniquePositions
        // if not listed add to uniquePositions and set index pointer
        // if listed use its index in uniquePositions and new index pointer
        for (let j = 0; j < 3; j++) {
          let ptr = uniquePositions[pstring[j]];
          if (ptr === undefined) {
            uniquePositions[pstring[j]] = mapPtr;
            ptr = mapPtr++;
            // not listed so add individual x, y, z coordinates to new positions array newPdata
            // and add matching normal data to new normals array newNdata
            for (let k = 0; k < 3; k++) {
              newPdata.push(pdata[3 * facet[j] + k]);
            }
          }
          // add new index pointer to new indices array newIdata
          newIdata.push(ptr);
        }
      }
    }

    const newNdata = []; // new normal data

    VertexData.ComputeNormals(newPdata, newIdata, newNdata);

    // create new vertex data object and update
    const vertexData = new VertexData();
    vertexData.positions = newPdata;
    vertexData.indices = newIdata;
    vertexData.normals = newNdata;
    vertexData.applyToMesh((this.mesh as Mesh), true);
  }
}
